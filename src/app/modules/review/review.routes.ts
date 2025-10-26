import express from "express"
import checkAuth from "../../middlewares/checkAuth"
import { UserRole } from "@prisma/client"
import { ReviewController } from "./review.controller"

const router = express.Router()

router.post("/",
    checkAuth(UserRole.PATIENT),
    ReviewController.insertIntoDB
)


export const reviewRoutes = router;