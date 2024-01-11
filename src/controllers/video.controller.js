import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  const videosToSkip = (parseInt(page) - 1) * parseInt(limit);
  if (!userId) throw new ApiError(404, "user id not found");
  const allVideoQuery = Video.find({ owner: userId })
    .skip(videosToSkip)
    .limit(limit);

  if (sortBy && sortBy)
    allVideoQuery.sort({ [sortBy]: sortType === "ascending" ? 1 : -1 });
  const allVideos = await allVideoQuery;
  return res
    .status(200)
    .json(new ApiResponse(200, allVideos, "all videos fetched"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const videoFilePath = req.files?.videoFile[0].path;
  const thumbnailPath = req.files?.thumbnail[0].path;
  const { _id } = req.user;
  // TODO: get video, upload to cloudinary, create video
  if (!title || !description || !videoFilePath || !thumbnailPath)
    throw new ApiError(
      404,
      "videoFile, thumbnail, title and description are required"
    );
  const videoFile = await uploadOnCloudinary(videoFilePath);
  const thumbnailFile = await uploadOnCloudinary(thumbnailPath);
  const videoCreated = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnailFile.url,
    duration: videoFile.duration,
    owner: _id,
  });
  return res
    .status(201)
    .json(new ApiResponse(200, videoCreated, "Video Published Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId) throw new ApiError(404, "video id not found");
  const video = await Video.findById({ _id: videoId });
  return res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(404, "video id not found");
  const { title, description } = req.body;
  const thumbnailPath = req.files?.thumbnail[0].path;
  //TODO: update video details like title, description, thumbnail
  if (!(title || description || thumbnailPath))
    throw new ApiError(404, "Video details not found");
  const thumbnailFile =
    thumbnailPath && (await uploadOnCloudinary(thumbnailPath));

  const documentToUpdateWith = {
    ...(title && { title }),
    ...(description && { description }),
    ...(thumbnailFile?.url && { thumbnail: thumbnailFile.url }),
  };
  const updatedVideo = await Video.updateOne(
    { _id: videoId },
    {
      $set: documentToUpdateWith,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video Updated"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) throw new ApiError(404, "video id not found");
  await Video.findOneAndDelete({ _id: videoId });
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(404, "video id not found");
  const updatedVideo = await Video.findOneAndUpdate(
    { _id: videoId },
    [{ $set: { isPublished: { $not: "$isPublished" } } }],
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video publish status changed"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
