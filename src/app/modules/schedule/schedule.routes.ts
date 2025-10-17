import  express  from "express"
import { ScheduleController } from "./schedule.controller"
import checkAuth from "../../middlewares/checkAuth"
import { UserRole } from "@prisma/client"

const router = express.Router()


router.get("/",
    checkAuth(UserRole.ADMIN,UserRole.DOCTOR),
     ScheduleController.getScheduleForDoctor)

router.post("/", ScheduleController.createSchedule)

router.delete("/:id", ScheduleController.deleteScheduleFromDb)


export const scheduleRoutes = router;