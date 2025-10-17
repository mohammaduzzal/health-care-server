import  express  from "express"
import { DoctorScheduleController } from "./doctorSchedule.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";


const router = express.Router()




router.post("/",
    checkAuth(UserRole.DOCTOR),
     DoctorScheduleController.createDoctorSchedule)




export const doctorScheduleRoutes = router;