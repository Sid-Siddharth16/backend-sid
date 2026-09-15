import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
// enable CORS for all routes
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

//routes declaation

app.use("/api/v1/users", userRouter);


export default app;