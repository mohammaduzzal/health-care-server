import { Review } from "@prisma/client";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus  from "http-status";

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
            rating : payload.rating as number,
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

export const ReviewService = {
    insertIntoDB
}