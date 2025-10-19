import z from "zod";

const createDoctorScheduleValidationSchema = z.object({
    body :z.object({
        scheduleId : z.array(z.string())
    })
})



export const doctorScheduleValidation = {
    createDoctorScheduleValidationSchema
}