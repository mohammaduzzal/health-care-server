import { NextFunction, Request, Response } from "express";
import { jwtHelper } from "../helper/jwtHelper";
import config from "../../config";
import ApiError from "../errors/ApiError";
import httpStatus from "http-status"

const checkAuth = (...roles : string[]) =>{
    return async(req :Request & {user?:any}, res : Response, next :NextFunction) =>{
        try {
            const token = req.cookies.accessToken
            if(!token){
                throw new ApiError(httpStatus.UNAUTHORIZED, "you are not authorized")
            }

            const verifyUser = jwtHelper.verifyToken(token, config.jwt.jwt_access_secret as string)

            req.user = verifyUser

            if(roles.length && !roles.includes(verifyUser.role)){
                 throw new ApiError(httpStatus.UNAUTHORIZED,"you are not authorized")
            }

            next()

        } catch (error) {
            next(error)
        }
    }
}


export default checkAuth;