import { UserGender } from "@prisma/client";
import z from "zod";

export const createPatientValidationSchema = z.object({
    password: z.string(),
    patient: z.object({
        name: z.string().nonempty("name is required"),
        email: z.string().nonempty("email is required"),
        address: z.string().optional()
    })
})

export const createDoctorValidationSchema = z.object({
    password: z.string(),
    doctor: z.object({
        name: z.string().nonempty("name is required"),
        email: z.string().nonempty("email is required"),
        address: z.string().optional(),
        experience: z.number().optional(),
        contactNumber: z.string().nonempty("Contact Number is required!"),
        registrationNumber: z.string().nonempty("Reg number is required"),
        gender: z.enum([UserGender.MALE, UserGender.FEMALE]),
        appointmentFee: z.number().nonnegative("appointment fee must be positive"),
        qualification: z.string().nonempty("quilification is required"),
        currentWorkingPlace: z.string().nonempty("Current working place is required!"),
        designation: z.string().nonempty("Designation is required!")
    })
})


const createAdminValidationSchema = z.object({
    password: z.string(),
    admin: z.object({
        name: z.string().nonempty("Name is required!"),
        email: z.string().nonempty("Email is required!"),
        contactNumber: z.string().nonempty("Contact Number is required!")
    })
});



export const UserValidation = {
    createPatientValidationSchema,
    createDoctorValidationSchema,
    createAdminValidationSchema
}