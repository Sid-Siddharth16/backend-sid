import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
// enable CORS for specific routes
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}));

// parse incoming JSON requests and limit the size to 16kb
app.use(express.json({limit: "16kb"})) 

// parse incoming URL-encoded requests and limit the size to 16kb
app.use(express.urlencoded({extended: true, limit: "16kb"}))

// serve static files from the "public" directory
app.use(express.static("public"))

// parse cookies from incoming requests
app.use(cookieParser())



//routes import
import userRouter from "./routes/user.routes.js";

//routes declaration
app.use("/api/v1", userRouter);

// swagger docs: UI at /api-docs, raw spec at /api-docs.json
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
const openapiSpec = JSON.parse(readFileSync(new URL("./docs/openapi.json", import.meta.url), "utf-8"));
app.get("/api-docs.json", (req, res) => res.json(openapiSpec));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

// error handling middleware
import multer from "multer";
import fs from "fs";

// temp files multer saved for a request that failed before reaching Cloudinary
const removeTempUploads = (req) => {
    const files = [req.file, ...Object.values(req.files ?? {}).flat()].filter(Boolean);
    files.forEach(({ path }) => {
        if (path && fs.existsSync(path)) fs.unlinkSync(path);
    });
};

app.use((err, req, res, next) => {
    removeTempUploads(req);

    if (err instanceof multer.MulterError) {
        const message = err.code === "LIMIT_FILE_SIZE" ? "File is too large (max 100 MB)" : err.message;
        return res.status(400).json({ success: false, message, errors: [] });
    }

    res.status(err.statusCode || 500).json({
        success: false, message: err.message, errors: err.errors || []
    });
});

export default app;