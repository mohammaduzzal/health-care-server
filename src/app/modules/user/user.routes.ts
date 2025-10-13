import express, { NextFunction, Request, Response } from "express"
import { UserController } from "./user.controller"
import { fileUploader } from "../../helper/fileUploader"
import { UserValidation } from "./user.validation"
import checkAuth from "../../middlewares/checkAuth"
import { UserRole } from "@prisma/client"


const router = express.Router()


router.get("/",
    checkAuth(UserRole.ADMIN),
    UserController.getAllUsers)


router.post("/create-patient",
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = UserValidation.createPatientValidationSchema.parse(JSON.parse(req.body.data))
        UserController.createPatient(req, res, next)
    },
)

router.post("/create-doctor",
    checkAuth(UserRole.ADMIN),
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = UserValidation.createDoctorValidationSchema.parse(JSON.parse(req.body.data))
        UserController.createDoctor(req, res, next)
    },
)


router.post("/create-admin",
    checkAuth(UserRole.ADMIN),
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = UserValidation.createAdminValidationSchema.parse(JSON.parse(req.body.data))
        UserController.createAdmin(req, res, next)
    }
)

export const userRoutes = router