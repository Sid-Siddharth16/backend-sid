
import { Video } from "../models/video.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const uploadVideo = asyncHandler(async (req, res) => {
  // duration is not taken from the client; Cloudinary measures it
  const { title, description, isPublished } = req.body;

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  // both uploads run in parallel; each one removes its own temp file
  const [video, thumbnail] = await Promise.all([
    uploadOnCloudinary(videoLocalPath),
    uploadOnCloudinary(thumbnailLocalPath),
  ]);

  if (!video) {
    throw new ApiError(500, "Something went wrong while uploading video");
  }

  if (!thumbnail) {
    throw new ApiError(500, "Something went wrong while uploading thumbnail");
  }

  const newVideo = await Video.create({
    videoFile: video.secure_url,
    thumbnail: thumbnail.secure_url,
    title,
    description,
    duration: video.duration,
    isPublished,
    owner: req.user._id,
  });

  return res.status(201).json(new ApiResponse(201, newVideo, "Video uploaded successfully"));
});


const getMyVideos = asyncHandler(async (req, res) => {
  // newest first; without a sort MongoDB returns them in no guaranteed order
  const videos = await Video.find({ owner: req.user._id }).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, videos, "My videos fetched successfully"));
});

export { uploadVideo, getMyVideos };
