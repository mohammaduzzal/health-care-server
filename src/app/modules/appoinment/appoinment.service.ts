import { prisma } from "../../shared/prisma";
import { IJWTPayload } from "../../types/common";
import { v4 as uuidv4 } from 'uuid';

const createAppoinment = async(
    user : IJWTPayload,
     payload : {doctorId : string,scheduleId : string}
    ) =>{

    const patientData = await prisma.patient.findUniqueOrThrow({
        where :{
            email : user.email
        }
    })

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where :{
            id : payload.doctorId,
            isDeleted : false
        }
    })


    const checkingIsBookedOrNot = await prisma.doctorSchedules.findFirstOrThrow({
        where : {
            doctorId : payload.doctorId,
            scheduleId: payload.scheduleId,
            isBooked : false
        }
    })


    const videoCallingId = uuidv4();

    // console.log({patientId : patientData.id,doctorId : doctorData.id,scheduleId : payload.scheduleId,videoCallingId })

    const result = await prisma.$transaction(async(tnx)=>{
         const appoinmentData = await tnx.appoinment.create({
        data :{
            patientId : patientData.id,
            doctorId : doctorData.id,
            scheduleId : payload.scheduleId,
            videoCallingId
        }
    })

    await tnx.doctorSchedules.update({
        where : {
           doctorId_scheduleId :{
             doctorId : doctorData.id,
            scheduleId : payload.scheduleId,
           }
        },
        data : {
            isBooked : true
        }
    })

    const transactionId = uuidv4();

    await tnx.payment.create({
        data :{
            appoinmentId : appoinmentData.id,
            amount : doctorData.appointmentFee,
            transactionId
        }
    })

    return appoinmentData

    })

    

   return result
}

export const AppoinmentService = {
    createAppoinment
}