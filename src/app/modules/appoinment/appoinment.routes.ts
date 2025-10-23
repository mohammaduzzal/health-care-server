import express  from "express";
import { AppoinmentController } from "./appoinment.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";


const router = express.Router()

router.get(
    '/',
    checkAuth(UserRole.ADMIN),
    AppoinmentController.getAllFromDB
);

router.get("/my-appointments",
     checkAuth(UserRole.PATIENT, UserRole.DOCTOR),
     AppoinmentController.getMyAppoinment
)

router.post("/",
     checkAuth(UserRole.PATIENT),
     AppoinmentController.createAppoinment)

     router.patch(
    "/status/:id",
    checkAuth(UserRole.ADMIN, UserRole.DOCTOR),
    AppoinmentController.updateAppointmentStatus
)


export const appoinmentRoutes = router