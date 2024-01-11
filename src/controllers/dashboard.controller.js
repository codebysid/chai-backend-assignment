import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const { _id } = req.user;
  const videoStats = await Video.aggregate([
    {
      $match: {
        owner: _id,
      },
    },
    {
      $group: {
        _id: "$owner",
        totalViews: { $sum: "$views" },
        numberOfVideos: { $sum: 1 },
      },
    },
  ]);

  const totalSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: _id,
      },
    },
    {
      $count: "numberOfSubscribers",
    },
  ]);

  const totalLikes = await Like.aggregate([
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video_details",
      },
    },
    {
      $unwind: "$video_details",
    },
    {
      $match: {
        "video_details.owner": _id,
      },
    },
    {
      $count: "totalLikes",
    },
  ]);

  const documentToSend = {
    videoStats,
    numberOfSubscribers: totalSubscribers[0].numberOfSubscribers,
    totalLikes: totalLikes[0].totalLikes,
  };
  return res
    .status(200)
    .json(new ApiResponse(200, documentToSend, "stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { _id } = req.user;
  if (!_id) throw new ApiError(404, "user id not found");
  const allVideos = await Video.find({ owner: _id });
  return res
    .status(200)
    .json(new ApiResponse(200, allVideos, "all videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
