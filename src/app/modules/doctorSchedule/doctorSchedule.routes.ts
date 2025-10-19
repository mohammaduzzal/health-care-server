import  express  from "express"
import { DoctorScheduleController } from "./doctorSchedule.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import validateSchema from "../../middlewares/validateRequest";
import { doctorScheduleValidation } from "./doctorSchedule.validation";


const router = express.Router()




router.post("/",
    checkAuth(UserRole.DOCTOR),
    validateSchema(doctorScheduleValidation.createDoctorScheduleValidationSchema),
     DoctorScheduleController.createDoctorSchedule)




export const doctorScheduleRoutes = router;