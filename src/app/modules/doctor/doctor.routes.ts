import express from "express";
import { DoctorController } from "./doctor.controller";
import { UserRole } from "@prisma/client";
import checkAuth from "../../middlewares/checkAuth";
const router = express.Router();

router.get(
    "/",
    DoctorController.getAllFromDB
)


router.post("/suggestion", DoctorController.getAiSuggestions)

router.get('/:id', DoctorController.getByIdFromDB)

router.patch(
    "/:id",
    DoctorController.updateIntoDB
)


router.delete(
    '/:id',
    checkAuth(UserRole.ADMIN),
    DoctorController.deleteFromDB
);

router.delete(
    '/soft/:id',
    checkAuth(UserRole.ADMIN),
    DoctorController.softDelete);


export const doctorRoutes = router;