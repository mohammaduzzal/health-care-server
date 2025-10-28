import express from "express"
import checkAuth from "../../middlewares/checkAuth"
import { UserRole } from "@prisma/client"
import { MetaController } from "./meta.controller"


const router = express.Router()

router.get("/",
    checkAuth(UserRole.PATIENT, UserRole.ADMIN,UserRole.DOCTOR),
    MetaController.fetchDashboardMetaData
)


export const metaRoutes = router;