import { Prisma, Review } from "@prisma/client";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus  from "http-status";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";

const insertIntoDB = async(user : IJWTPayload, payload :Partial<Review> ) =>{

    const patientData = await prisma.patient.findUniqueOrThrow({
        where :{
            email : user.email
        }
    })


    const appointmentData = await prisma.appoinment.findUniqueOrThrow({
        where:{
            id : payload.appointmentId
        }
    })


    if(patientData.id !== appointmentData.patientId){

        throw new ApiError(httpStatus.BAD_REQUEST, "this is not your appointment")
    }

    return await prisma.$transaction(async(tnx) =>{

         const result = await tnx.review.create({
        data :{
            appointmentId : appointmentData.id,
            doctorId : appointmentData.doctorId,
            patientId : appointmentData.patientId,
            rating : Number(payload.rating ),
            comment : payload.comment
        }
    })



    const avgRatting = await tnx.review.aggregate({
        _avg : {
            rating:true
        },
        where : {
            doctorId : appointmentData.doctorId
        }
    })


    await tnx.doctor.update({
         where : {
            id : appointmentData.doctorId
         },
         data :{
            averageRatting : avgRatting._avg.rating as number
         }
    })

    return result

    })

}


const getAllFromDB = async (
    filters: any,
    options: IOptions,
) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { patientEmail, doctorEmail } = filters;
    const andConditions = [];

    if (patientEmail) {
        andConditions.push({
            patient: {
                email: patientEmail
            }
        })
    }

    if (doctorEmail) {
        andConditions.push({
            doctor: {
                email: doctorEmail
            }
        })
    }

    const whereConditions: Prisma.ReviewWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.review.findMany({
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
            patient: true,
            //appointment: true,
        },
    });
    const total = await prisma.review.count({
        where: whereConditions,
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


export const ReviewService = {
    insertIntoDB,
    getAllFromDB
}