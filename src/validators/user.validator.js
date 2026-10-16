import { z } from "zod";

// password policy shared by register and change-password (login is not checked, so older accounts can still sign in)
const passwordSchema = (field) =>
    z
        .string({ error: `${field} is required` })
        .min(8, `${field} must be at least 8 characters`)
        .max(64, `${field} must be at most 64 characters`)
        .regex(/[a-z]/, `${field} must contain a lowercase letter`)
        .regex(/[A-Z]/, `${field} must contain an uppercase letter`)
        .regex(/[0-9]/, `${field} must contain a number`)
        .regex(/[^A-Za-z0-9]/, `${field} must contain a special character`);

const registerSchema = z.object({
    fullName: z
        .string({ error: "fullName is required" })
        .trim()
        .min(1, "fullName is required")
        .max(50, "fullName must be at most 50 characters"),
    email: z
        .string({ error: "email is required" })
        .trim()
        .toLowerCase()
        .pipe(z.email("Invalid email address")),
    userName: z
        .string({ error: "userName is required" })
        .trim()
        .toLowerCase()
        .min(3, "userName must be at least 3 characters")
        .max(30, "userName must be at most 30 characters")
        .regex(/^[a-z0-9_]+$/, "userName can only contain letters, numbers and underscores"),
    password: passwordSchema("password"),
});

// same rules as register, but every field is optional (at least one is required)
const editProfileSchema = registerSchema
    .pick({ fullName: true, email: true, userName: true })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: "Provide at least one of fullName, email or userName",
    });

const changePasswordSchema = z
    .object({
        currentPassword: z
            .string({ error: "currentPassword is required" })
            .min(1, "currentPassword is required"),
        newPassword: passwordSchema("newPassword"),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password cannot be the same as the current password",
        path: ["newPassword"],
    });

export { registerSchema, editProfileSchema, changePasswordSchema };
