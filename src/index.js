import dotenv from "dotenv";
import connectToDatabase from "./db/index.js";
import app from "./app.js";

// load environment variables from .env file
dotenv.config({
    path: "./env"
})

// connect to database and start the server
connectToDatabase()
    .then(
        () => {
            app.listen(process.env.PORT || 8000, () => {
                console.log(`APP is running on port ${process.env.PORT}`);
            })
        }
    )
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    }
    )