import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from '../utils/ApiResponse.js';



const home = asyncHandler(async (req, res) => {
    // here we handle the home route logic, which is a secured route that requires JWT verification.
    return res.status(200).json(new ApiResponse(200, null, "Welcome to the home route!"));
})

export { home };