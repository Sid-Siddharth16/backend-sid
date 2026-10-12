import { z } from "zod";

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
    password: z
        .string({ error: "password is required" })
        .min(8, "password must be at least 8 characters")
        .max(64, "password must be at most 64 characters"),
});

// same rules as register, but every field is optional (at least one is required)
const editProfileSchema = registerSchema
    .pick({ fullName: true, email: true, userName: true })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: "Provide at least one of fullName, email or userName",
    });

export { registerSchema, editProfileSchema };
