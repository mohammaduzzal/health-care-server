import { Request, Response } from "express";
import sendResponse from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import catchAsync from "../../shared/catchAsync";

const login = catchAsync(async(req : Request, res : Response) =>{

    const result = await AuthService.login(req.body)

    const {accessToken,refreshToken,needPasswordChange} =result

    res.cookie("accessToken",accessToken,{
        secure :true,
        httpOnly : true,
        sameSite : "none",
        maxAge : 1000 * 60 * 60
    })

    res.cookie("refreshToken",refreshToken,{
        secure :true,
        httpOnly : true,
        sameSite : "none",
        maxAge : 1000 * 60 * 60 * 24 * 90
    })
    

    sendResponse(res,{
        statusCode : 200,
        success : true,
        message : "user loggedin successfully",
        data : {
            needPasswordChange
        }
    })
})



export const AuthController ={
   login
}