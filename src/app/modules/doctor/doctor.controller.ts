import pick from "../../helper/pick";
import sendResponse from "../../shared/sendResponse";
import { doctorFilterableFields } from "./doctor.constant";
import catchAsync from "../../shared/catchAsync";
import { Request, Response } from "express";
import { DoctorService } from "./doctor.service";

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const fillters = pick(req.query, doctorFilterableFields)

    const result = await DoctorService.getAllFromDB(fillters, options);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Doctor fetched successfully!",
        meta: result.meta,
        data: result.data
    })
})

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;

    const result = await DoctorService.updateIntoDB(id, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Doctor updated successfully!",
        data: result
    })
})


const getAiSuggestions = catchAsync(async (req: Request, res: Response) => {

    const result = await DoctorService.getAiSuggestions(req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Ai suggestions fetched successfully!",
        data: result
    })
})


export const DoctorController = {
    getAllFromDB,
    updateIntoDB,
    getAiSuggestions
}