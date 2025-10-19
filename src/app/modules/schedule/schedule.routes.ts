import  express  from "express"
import { ScheduleController } from "./schedule.controller"
import checkAuth from "../../middlewares/checkAuth"
import { UserRole } from "@prisma/client"

const router = express.Router()


router.get("/",
    checkAuth(UserRole.ADMIN,UserRole.DOCTOR),
     ScheduleController.getScheduleForDoctor)

router.post("/",
    checkAuth(UserRole.ADMIN),
     ScheduleController.createSchedule)

router.delete("/:id",
    checkAuth(UserRole.ADMIN),
     ScheduleController.deleteScheduleFromDb)


export const scheduleRoutes = router;