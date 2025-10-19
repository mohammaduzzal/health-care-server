import { UserStatus } from "@prisma/client";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { jwtHelper } from "../../helper/jwtHelper";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status"


const login = async(payload : {email :string,password :string}) =>{

    const user = await prisma.user.findUniqueOrThrow({
        where :{
            email : payload.email,
            status : UserStatus.ACTIVE
        }
    })

    // pass matching
    const isPasswordMatched = await bcrypt.compare(payload.password, user.password)

    if(!isPasswordMatched){
        throw new ApiError(httpStatus.BAD_REQUEST,"password incorrect")
    }

    // token generate
    const accessToken =  jwtHelper.generateToken({email :user.email, role:user.role}, config.jwt.jwt_access_secret as string,config.jwt.jwt_access_expire as string )

    const refreshToken = jwtHelper.generateToken({email :user.email, role:user.role}, config.jwt.jwt_refresh_secret as string, config.jwt.jwt_refresh_expire as string)

return {
    accessToken,
    refreshToken,
    needPasswordChange : user.needPasswordChange
}

}

export const AuthService ={
    login
}