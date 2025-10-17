import { addHours,addMinutes, format } from "date-fns";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { Prisma } from "@prisma/client";
import { IJWTPayload } from "../../types/common";


const createSchedule = async(payload : any) =>{
    const {startTime, endTime, startDate, endDate} = payload
    
    const intervalTime = 30;

    const schedules = [];

    const currentDate = new Date(startDate)
    const lastDate = new Date(endDate)


    while(currentDate <= lastDate){

        const startDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(startTime.split(":")[0])
                ),
                Number(startTime.split(":")[1])
            )
        )

        const endDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(endTime.split(":")[0])
                ),
                Number(endTime.split(":")[1])
            )
        )

        

        while(startDateTime < endDateTime){
            const slotStartDateTime = startDateTime;
            const slotEndDateTime = addMinutes(startDateTime, intervalTime);

            const scheduleData = {
                startDateTime : slotStartDateTime,
                endDateTime : slotEndDateTime
            }


            const existingSchedule = await prisma.schedule.findFirst({
                where : scheduleData
            })


            if(!existingSchedule){
                const result = await prisma.schedule.create({
                    data : scheduleData
                })
                schedules.push(result)
            }

            slotStartDateTime.setMinutes(slotStartDateTime.getMinutes() + intervalTime)

        }


        currentDate.setDate(currentDate.getDate() + 1)
    }


    return schedules 
}



const getScheduleForDoctor = async(
    user: IJWTPayload,
    filters : any,
    options:IOptions
) =>{

const {page,limit,skip,sortby,sortOrder} = paginationHelper.calculatePagination(options)
const {startDateTime : filterStartDateTime,endDateTime : filterEndDateTime} = filters

const andCondiion : Prisma.ScheduleWhereInput[] = []

if(filterStartDateTime && filterEndDateTime){
    andCondiion.push({
        AND:[
            {
                startDateTime :{
                    gte : filterStartDateTime
                }
            },
            {
                endDateTime : {
                    lte : filterEndDateTime
                }
            }
        ]
    })
}


 const whereConditions : Prisma.ScheduleWhereInput = andCondiion.length > 0 ? {AND : andCondiion} : {}

// doc booking schedule
 const doctorSchedules = await prisma.doctorSchedules.findMany({
    where:{
        doctor :{
            email : user.email
        }
    },
    select :{
        scheduleId : true
    }
 })

//  making a array of scheduleId for doc
  const doctorSchedulesIds = doctorSchedules.map(schedule => schedule.scheduleId)





     const result = await prisma.schedule.findMany({
        skip,
        take: limit,
        where: {
            ...whereConditions,
            id :{
                notIn : doctorSchedulesIds
            }

        },
        orderBy : {
            [sortby] : sortOrder
        } 
    })


    const total = await prisma.schedule.count({
        where: {
            ...whereConditions,
            id :{
                notIn : doctorSchedulesIds
            }

        },
    })


    return {
        meta : {
            page,
            limit,
            total
        },
        data : result
    }
}



const deleteScheduleFromDb = async(id : string) =>{


    return await prisma.schedule.delete({
        where :{
            id
        }
    })
}

export const ScheduleService = {
    createSchedule,
    getScheduleForDoctor,
    deleteScheduleFromDb
}