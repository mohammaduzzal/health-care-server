import { prisma } from "../../shared/prisma"
import { IJWTPayload } from "../../types/common"

const createDoctorSchedule = async(user :IJWTPayload,payload : {
   scheduleId : string[]
}) =>{
   
   const doctorData = await prisma.doctor.findUniqueOrThrow({
      where :{
         email : user.email
      }
   })

   const doctorScheduleData = payload.scheduleId.map(scheduleId =>({
      doctorId : doctorData.id,
      scheduleId
   }))

  

   return await prisma.doctorSchedules.createMany({
      data : doctorScheduleData
   })
}

export const DoctorScheduleService = {
   createDoctorSchedule
}