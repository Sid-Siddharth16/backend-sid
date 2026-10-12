class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = []
    ) {
        super(message);

        this.name = "ApiError";
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;

        Error.captureStackTrace?.(this, ApiError);
    }
}

export { ApiError };