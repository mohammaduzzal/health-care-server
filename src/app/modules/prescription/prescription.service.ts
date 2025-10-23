import { AppoinmentStatus, PaymentStatus, Prescription, UserRole } from "@prisma/client"
import { IJWTPayload } from "../../types/common"
import { prisma } from "../../shared/prisma"
import ApiError from "../../errors/ApiError"
import httpStatus  from "http-status"
import { IOptions, paginationHelper } from "../../helper/paginationHelper"

const createPrescription = async(
    user : IJWTPayload,
    payload : Partial<Prescription>
) =>{

    const appointmentData = await prisma.appoinment.findUniqueOrThrow({
        where : {
            id : payload.appoinmentId,
            status : AppoinmentStatus.COMPLETED,
            paymentStatus : PaymentStatus.PAID
        },
        include : {
            doctor : true
        }
    })

     if (user.role === UserRole.DOCTOR) {
        if (!(user.email === appointmentData.doctor.email))
            throw new ApiError(httpStatus.BAD_REQUEST, "This is not your appointment")
    }

    const result = await prisma.prescription.create({
        data : {
             appoinmentId : appointmentData.id,
             doctorId : appointmentData.doctorId,
             patientId : appointmentData.patientId,
             instructions : payload.instructions as string,
             followUpdate : payload.followUpdate || null
        },
        include :{
            patient : true
        }
    })


    return result
}


const patientPrescription = async (user: IJWTPayload, options: IOptions) => {
    const { limit, page, skip, sortby, sortOrder } = paginationHelper.calculatePagination(options);

    const result = await prisma.prescription.findMany({
        where: {
            patient: {
                email: user.email
            }
        },
        skip,
        take: limit,
        orderBy: {
            [sortby]: sortOrder
        },
        include: {
            doctor: true,
            patient: true,
            appoinment: true
        }
    })

    const total = await prisma.prescription.count({
        where: {
            patient: {
                email: user.email
            }
        }
    })

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    }

};


export const PrescriptionService ={
    createPrescription,
    patientPrescription
}