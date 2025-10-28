import { AppoinmentStatus, PaymentStatus, Prisma, UserRole } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { stripe } from "../../helper/stripe";
import { prisma } from "../../shared/prisma";
import { IJWTPayload } from "../../types/common";
import { v4 as uuidv4 } from 'uuid';
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const createAppoinment = async (
    user: IJWTPayload,
    payload: { doctorId: string, scheduleId: string }
) => {

    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }
    })

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
            isDeleted: false
        }
    })


    const checkingIsBookedOrNot = await prisma.doctorSchedules.findFirstOrThrow({
        where: {
            doctorId: payload.doctorId,
            scheduleId: payload.scheduleId,
            isBooked: false
        }
    })


    const videoCallingId = uuidv4();

    // console.log({patientId : patientData.id,doctorId : doctorData.id,scheduleId : payload.scheduleId,videoCallingId })

    const result = await prisma.$transaction(async (tnx) => {
        const appoinmentData = await tnx.appoinment.create({
            data: {
                patientId: patientData.id,
                doctorId: doctorData.id,
                scheduleId: payload.scheduleId,
                videoCallingId
            }
        })

        await tnx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: doctorData.id,
                    scheduleId: payload.scheduleId,
                }
            },
            data: {
                isBooked: true
            }
        })

        const transactionId = uuidv4();

        const paymentData = await tnx.payment.create({
            data: {
                appoinmentId: appoinmentData.id,
                amount: doctorData.appointmentFee,
                transactionId
            }
        })

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment', // one-time payment
            customer_email: user.email,
            line_items: [
                {
                    price_data: {
                        currency: "bdt",
                        product_data: { name: `appoinment with Dr. ${doctorData.name}` },
                        unit_amount: doctorData.appointmentFee * 100,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                appoinmentId: appoinmentData.id,
                paymentId: paymentData.id
            },

            success_url: `https://javascript.info/`,
            cancel_url: `https://quran.com/#feedback`,
        });

        console.log(session)




        return { paymentUrl: session.url }

    })



    return result
}


const getMyAppoinment = async (
    user: IJWTPayload,
    options: IOptions,
    filters: any
) => {

    const { page, limit, skip, sortby, sortOrder } = paginationHelper.calculatePagination(options)
    const { ...filterData } = filters

    const andConditions: Prisma.AppoinmentWhereInput[] = []

    if (user.role === UserRole.PATIENT) {
        andConditions.push({
            patient: {
                email: user.email
            }
        })
    }
    else if (user.role === UserRole.DOCTOR) {
        andConditions.push({
            doctor: {
                email: user.email
            }
        })
    }

    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map(key => ({
            [key]: {
                equals: (filterData as any)[key]
            }
        }))
        andConditions.push(...filterConditions)
    }

    const whereConditions: Prisma.AppoinmentWhereInput = andConditions.length > 0 ? { AND: andConditions } : {}

    const result = await prisma.appoinment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortby]: sortOrder
        },
        include: user.role === UserRole.DOCTOR ? { patient: true } : { doctor: true }
    })


    const total = await prisma.appoinment.count({
        where: whereConditions
    })



    return {
        meta: {
            total,
            limit,
            page
        },
        data: result
    }
}


const getAllFromDB = async (
    filters: any,
    options: IOptions
) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { patientEmail, doctorEmail, ...filterData } = filters;
    const andConditions = [];

    if (patientEmail) {
        andConditions.push({
            patient: {
                email: patientEmail
            }
        })
    }
    else if (doctorEmail) {
        andConditions.push({
            doctor: {
                email: doctorEmail
            }
        })
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => {
                return {
                    [key]: {
                        equals: (filterData as any)[key]
                    }
                };
            })
        });
    }

    // console.dir(andConditions, { depth: Infinity })
    const whereConditions: Prisma.AppoinmentWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.appoinment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortby && options.sortOrder
                ? { [options.sortby]: options.sortOrder }
                : {
                    createdAt: 'desc',
                },
        include: {
            doctor: true,
            patient: true
        }
    });
    const total = await prisma.appoinment.count({
        where: whereConditions
    });

    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
};


const updateAppointmentStatus = async (appointmentId: string, status: AppoinmentStatus, user: IJWTPayload) => {
    const appointmentData = await prisma.appoinment.findUniqueOrThrow({
        where: {
            id: appointmentId
        },
        include: {
            doctor: true
        }
    });

    if (user.role === UserRole.DOCTOR) {
        if (!(user.email === appointmentData.doctor.email))
            throw new ApiError(httpStatus.BAD_REQUEST, "This is not your appointment")
    }

    return await prisma.appoinment.update({
        where: {
            id: appointmentId
        },
        data: {
            status
        }
    })

}


const cancelUnpaidAppointments = async () => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

    const unPaidAppointments = await prisma.appoinment.findMany({
        where: {
            createdAt: {
                lte: thirtyMinAgo
            },
            paymentStatus: PaymentStatus.UNPAID
        }
    })

    const appointmentIdsToCancel = unPaidAppointments.map(appointment => appointment.id);

    await prisma.$transaction(async (tnx) => {
        await tnx.payment.deleteMany({
            where: {
                appoinmentId: {
                    in: appointmentIdsToCancel
                }
            }
        })

        await tnx.appoinment.deleteMany({
            where: {
                id: {
                    in: appointmentIdsToCancel
                }
            }
        })

        for (const unPaidAppointment of unPaidAppointments) {
            await tnx.doctorSchedules.update({
                where: {
                    doctorId_scheduleId: {
                        doctorId: unPaidAppointment.doctorId,
                        scheduleId: unPaidAppointment.scheduleId
                    }
                },
                data: {
                    isBooked: false
                }
            })
        }
    })
}



export const AppoinmentService = {
    createAppoinment,
    getMyAppoinment,
    getAllFromDB,
    updateAppointmentStatus,
    cancelUnpaidAppointments
}