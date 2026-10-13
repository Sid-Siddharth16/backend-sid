import { z } from "zod";

const uploadVideoSchema = z.object({
    title: z
        .string({ error: "title is required" })
        .trim()
        .min(1, "title is required")
        .max(100, "title must be at most 100 characters"),
    description: z
        .string({ error: "description is required" })
        .trim()
        .min(1, "description is required")
        .max(5000, "description must be at most 5000 characters"),
    // multipart sends strings; stringbool maps "false" to false (z.coerce.boolean would make it true)
    isPublished: z.stringbool().optional(),
});

export { uploadVideoSchema };
