import { Request } from "express";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { fileUploader } from "../../helper/fileUploader";
import { Admin, Doctor, Prisma,  UserRole, UserStatus } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { userSearchableFields } from "./user.constant";
import { IJWTPayload } from "../../types/common";

const createPatient = async (req: Request) => {
    const file = req.file
    if (file) {
        const uploaderResult = await fileUploader.uploadToCloudinary(file)
        req.body.patient.profilePhoto = uploaderResult?.secure_url
    }


    const hashedPassword = await bcrypt.hash(req.body.password, Number(config.bcrypt_salt_round))

    const result = await prisma.$transaction(async (tnx) => {
        await tnx.user.create({
            data: {
                email: req.body.patient.email,
                password: hashedPassword
            }
        })

        return await tnx.patient.create({
            data: req.body.patient
        })
    })

    return result

}


const createDoctor = async (req: Request): Promise<Doctor> => {
    const file = req.file
    if (file) {
        const uploaderResult = await fileUploader.uploadToCloudinary(file)
        req.body.doctor.profilePhoto = uploaderResult?.secure_url
    }

    const hashedPassword = await bcrypt.hash(req.body.password, Number(config.bcrypt_salt_round))

    const userData = {
        email: req.body.doctor.email,
        password: hashedPassword,
        role: UserRole.DOCTOR
    }

    const result = await prisma.$transaction(async (tnx) => {
        await tnx.user.create({
            data: userData
        })

        const createDoctorData = await tnx.doctor.create({
            data: req.body.doctor
        })

        return createDoctorData


    })

    return result
}

const createAdmin = async (req: Request): Promise<Admin> => {
    const file = req.file
    if (file) {
        const uploaderResult = await fileUploader.uploadToCloudinary(file)
        req.body.admin.profilePhoto = uploaderResult?.secure_url
    }

    const hashedPassword = await bcrypt.hash(req.body.password, Number(config.bcrypt_salt_round))

    const userData = {
        email: req.body.admin.email,
        password: hashedPassword,
        role: UserRole.ADMIN
    }

    const result = await prisma.$transaction(async (tnx) => {
        await tnx.user.create({
            data: userData
        })

        const createAdminData = await tnx.admin.create({
            data: req.body.admin
        })

        return createAdminData


    })

    return result
}


const getAllUsers = async (params :any, options :IOptions) => {

    const {page,limit,skip,sortby,sortOrder} = paginationHelper.calculatePagination(options)

    const {searchTerm, ...filterData} = params;

    const andCondiion : Prisma.UserWhereInput[] = []

    if(searchTerm){
     andCondiion.push({
           OR : userSearchableFields.map(field => ({
            [field] :{
                contains: searchTerm,
                mode: "insensitive"
            }
        }))
     })
    }


    if(Object.keys(filterData).length > 0){
        andCondiion.push({
            AND : Object.keys(filterData).map(key =>({
                [key] : {
                    equal : (filterData as any)[key]
                }
            }))
        })
    }


    const whereConditions : Prisma.UserWhereInput = andCondiion.length > 0 ? {AND : andCondiion} : {}


    const result = await prisma.user.findMany({
        skip,
        take: limit,
        where: whereConditions,
        orderBy : {
            [sortby] : sortOrder
        } 
    })


    const total = await prisma.user.count({
        where : whereConditions
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



const getMyProfile = async(user : IJWTPayload) =>{

    const userInfo = await prisma.user.findUniqueOrThrow({
        where : {
            email : user.email,
            status : UserStatus.ACTIVE
        },
        select : {
            id : true,
            email : true,
            needPasswordChange : true,
            role : true,
            status : true
        }
    })

    let profileData;

    if(userInfo.role === UserRole.PATIENT){
         profileData = await prisma.patient.findUnique({
            where : {
                email : userInfo.email
            }
         })
    }
    else if(userInfo.role === UserRole.ADMIN){
         profileData = await prisma.admin.findUnique({
            where : {
                email : userInfo.email
            }
         })
    }
    else if(userInfo.role === UserRole.DOCTOR){
         profileData = await prisma.doctor.findUnique({
            where : {
                email : userInfo.email
            }
         })
    }



    return {
        ...userInfo,
        ...profileData
    };
}


const changeProfileStatus = async(id : string, payload : {status : UserStatus}) =>{

    const userData = await prisma.user.findUniqueOrThrow({
        where :{
            id
        }
    })

    const updateUserStatus = await prisma.user.update({
        where :{
            id
        },
        data : payload
    })




    return updateUserStatus;
}



export const UserService = {
    createPatient,
    createDoctor,
    createAdmin,
    getAllUsers,
    getMyProfile,
    changeProfileStatus
}