import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../shared/sendResponse";
import pick from "../../helper/pick";
import { userFilterableFields } from "./user.constant";

const createPatient = catchAsync(async(req : Request, res : Response) =>{

    const result = await UserService.createPatient(req)
    

    sendResponse(res,{
        statusCode : 201,
        success : true,
        message : "patient created successfully",
        data : result
    })
})

const createDoctor = catchAsync(async(req : Request, res : Response) =>{

    const result = await UserService.createDoctor(req)
    

    sendResponse(res,{
        statusCode : 201,
        success : true,
        message : "doctor created successfully",
        data : result
    })
})

const createAdmin = catchAsync(async(req : Request, res : Response) =>{

    const result = await UserService.createAdmin(req)
    
console.log(result)
    sendResponse(res,{
        statusCode : 201,
        success : true,
        message : "admin created successfully",
        data : result
    })
})


const getAllUsers = catchAsync(async(req : Request, res : Response) =>{
    
    const filters = pick(req.query, userFilterableFields)
    const options = pick(req.query, ["page", "limit", "sortby", "sortOrder"])

    const result = await UserService.getAllUsers(filters,options)
    

    sendResponse(res,{
        statusCode : 200,
        success : true,
        message : "users retrieved successfully",
        meta : result.meta,
        data : result.data
    })
})



export const UserController ={
    createPatient,
    createDoctor,
    createAdmin,
    getAllUsers
}