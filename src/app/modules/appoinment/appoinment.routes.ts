import express  from "express";
import { AppoinmentController } from "./appoinment.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";


const router = express.Router()

router.post("/",
     checkAuth(UserRole.PATIENT),
     AppoinmentController.createAppoinment)


export const appoinmentRoutes = router