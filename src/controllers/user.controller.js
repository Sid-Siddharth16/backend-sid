import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken"


const generateAccessandRefreshToken = async (userId) => {
    try {

        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token");
    }
}

const options = {
    httpOnly: true,
    secure: false,
}

const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend (already validated by registerSchema)
    const { fullName, email, userName, password } = req.body

    // check if user already exist: username, email
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exist")
    }

    // check for images, avatar
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    // upload them to cloudinary in parallel (uploadOnCloudinary returns null for a missing path)
    const [avatar, coverImage] = await Promise.all([
        uploadOnCloudinary(avatarLocalPath),
        uploadOnCloudinary(coverImageLocalPath)
    ])


    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage ? coverImage.url : "",
        email,
        password,
        userName

    })

    // remove pass and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // check for user creation 
    if (!createdUser) {
        throw new ApiError(500, "Something Went wrong while registering the user");
    }

    // return res
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered succesfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {

    const { email, userName, password } = req.body;

    if (!(email || userName)) {
        throw new ApiError(400, "Email or Username are missing")
    }

    const user = await User.findOne({
        $or: [{ email }, { userName }]
    })

    if (!user) {
        throw new ApiError(404, "User does not Exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id);

    const loggedInUserDetail = await User.findById(user._id).select("-password -refreshToken");

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUserDetail, accessToken,
                refreshToken
            }, "User Logged In Successfully")
        );


})

const loggedOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    },
    )

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(
        new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorised Request");
    }

    try {
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedRefreshToken._id);

        if (!user) {
            throw new ApiError(401, "Invalid  Refresh Token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token expired");
        }


        const { accessToken, refreshToken: newRefreshToken } = await generateAccessandRefreshToken(user._id)

        return res.
            status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken,
                    },
                    "Access Token refreshed successfully!"
                )
            )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh Token");

    }


})

const dashboardUser = asyncHandler(async (req, res) => {
    // get user details from req.user
    const dasboardDetailsOfUser = await User.findById(req.user._id).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, dasboardDetailsOfUser, "Dashboard details fetched successfully"))
})

const editProfile = asyncHandler(async(req, res) => {
    //edit profile steps: extract the data from req body, check the user in db , then match the thing data changed then update in db and return the updated user details
    // body already validated (trimmed/lowercased) by editProfileSchema
    const { fullName, email, userName } = req.body;

    const user = await User.findById(req.user._id);

    if(!user){
        throw new ApiError(404, "User not found");
    }

    // make sure the new email / userName isn't taken by another user
    const orConditions = [];
    if (email && email !== user.email) orConditions.push({ email });
    if (userName && userName !== user.userName) orConditions.push({ userName });

    if (orConditions.length) {
        const existedUser = await User.findOne({ _id: { $ne: user._id }, $or: orConditions });
        if (existedUser) {
            throw new ApiError(409, existedUser.email === email ? "Email already in use" : "userName already in use");
        }
    }

    // check if the data has changed
    if(fullName && fullName !== user.fullName){
        user.fullName = fullName;
    }

    if(email && email !== user.email){
        user.email = email;
    }

    if(userName && userName !== user.userName){
        user.userName = userName;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, updatedUser, "Profile updated successfully"))
    
})


const changeAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar){
        throw new ApiError(500, "Something went wrong while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        avatar: avatar.url
    }, { new: true }).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"))

})

const changeCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover image file is required");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage){
        throw new ApiError(500, "Something went wrong while uploading cover image");
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        coverImage: coverImage.url
    }, { new: true }).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "Cover image updated successfully"))

})





export { registerUser, loginUser, loggedOutUser, refreshAccessToken, dashboardUser, editProfile , changeAvatar, changeCoverImage };