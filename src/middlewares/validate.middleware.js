import { ApiError } from "../utils/ApiError.js";

// validate req.body against a zod schema and replace it with the parsed (trimmed/lowercased) data
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));
        return next(new ApiError(400, errors[0].message, errors));
    }

    req.body = result.data;
    next();
};

export { validate };
