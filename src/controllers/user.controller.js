import asyncHandler from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler( async (req,res) => {
    //get user details from frontend
    // validations
    // check if user already exist: username, email
    // check for images, avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove pass and refresh token field from response
    // check for user creation 
    // return res

    const {fullName, email, userName, password} = req.body
    console.log("email:", password)

    if([fullName, email, userName, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "fullName is required")
    }

    const existedUser = User.findOne({
        $or : [{userName}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User already exist" )
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(avatarLocalPath)

    if( !avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    if( !coverImage) {
        throw new ApiError(400, "CoverImage file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.tpoLowerCase()

    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(createdUser) {
        throw new ApiError(500, "Something Went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered succesfully")
    )




})

export {registerUser}