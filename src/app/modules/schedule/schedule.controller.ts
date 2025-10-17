import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { ScheduleService } from "./schedule.service";
import sendResponse from "../../shared/sendResponse";
import pick from "../../helper/pick";
import { IJWTPayload } from "../../types/common";


const createSchedule = catchAsync(async(req : Request , res : Response) =>{

    const result = await ScheduleService.createSchedule( req.body)

    sendResponse(res, {
        statusCode : 201,
         success : true,
         message : "Schedule created successfully",
         data : result
    })
})


const getScheduleForDoctor = catchAsync(async(req : Request & {user ?: IJWTPayload}, res : Response) =>{

    const filters = pick(req.query, ["startDateTime", "endDateTime"])
    const options = pick(req.query, ["page", "limit", "sortby", "sortOrder"])

    const user = req.user
    
    const result = await ScheduleService.getScheduleForDoctor(user as IJWTPayload,filters,options)

    sendResponse(res, {
        statusCode : 200,
         success : true,
         message : "Schedule gotten successfully",
         meta : result.meta,
        data : result.data
    })
})



const deleteScheduleFromDb = catchAsync(async(req : Request, res : Response) =>{


    const result = await ScheduleService.deleteScheduleFromDb(req.params.id)

    sendResponse(res, {
        statusCode : 200,
         success : true,
         message : "Schedule deleted successfully",
        data : result
    })
})


export const ScheduleController = {
    createSchedule,
    getScheduleForDoctor,
    deleteScheduleFromDb
}