import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import { AppoinmentService } from "./appoinment.service"
import { IJWTPayload } from "../../types/common"
import { JwtPayload } from "jsonwebtoken"
import pick from "../../helper/pick"
import { appointmentFilterableFields } from "./appoinment.constant"
import  httpStatus  from "http-status"

const createAppoinment = catchAsync(async(req : Request & {user?: IJWTPayload}, res : Response) =>{

    const user = req.user
    const result = await AppoinmentService.createAppoinment(user as IJWTPayload,req.body)
    

    sendResponse(res,{
        statusCode : 201,
        success : true,
        message : "appoinment created successfully",
        data : result
    })
})

const getMyAppoinment = catchAsync(async(req : Request & {user?: IJWTPayload}, res : Response) =>{
    const options = pick(req.query, ["page", "limit","skip", "sortby", "sortOrder"])
    const filters = pick(req.query, ["status","paymentStatus"])
    const user = req.user
    const result = await AppoinmentService.getMyAppoinment(user as IJWTPayload,options,filters)
    

    sendResponse(res,{
        statusCode : 200,
        success : true,
        message : "appoinment retrieved successfully",
        meta :result.meta,
        data : result.data
    })
})


const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, appointmentFilterableFields)
    const options = pick(req.query, ['limit', 'page', 'sortby', 'sortOrder']);
    const result = await AppoinmentService.getAllFromDB(filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appointment retrieval successfully',
        meta: result.meta,
        data: result.data,
    });
});


const updateAppointmentStatus = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    const result = await AppoinmentService.updateAppointmentStatus(id, status, user as IJWTPayload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Appointment updated successfully!",
        data: result
    })
})


export const AppoinmentController = {
    createAppoinment,
    getMyAppoinment,
    getAllFromDB,
    updateAppointmentStatus
}