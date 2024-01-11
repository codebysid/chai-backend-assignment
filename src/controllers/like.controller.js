import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { _id } = req.user;
  //TODO: toggle like on video
  if (!videoId || !_id) return new ApiError(404, "video id not found");
  const existingLike = await Like.findOne({ video: videoId, likedBy: _id });
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res.status(200).json(new ApiResponse(200, null, "Like removed"));
  } else {
    const newLike = await Like({ video: videoId, likedBy: _id });
    newLike.save();
  }
  return res.status(200).json(new ApiResponse(200, null, "Like added"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { _id } = req.user;
  //TODO: toggle like on comment
  if (!commentId || !_id)
    return new ApiError(404, "commentId and userId(_id) required");

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: _id,
  });
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Comment like removed"));
  } else {
    const newLike = new Like({ comment: commentId, likedBy: _id });
    newLike.save();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Comment like added"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { _id } = req.user;
  //TODO: toggle like on tweet
  if (!tweetId || !_id)
    return new ApiError(404, "tweetId and userId(_id) required");
  const existingLike = await Like.findOne({ tweet: tweetId, likedBy: _id });
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res.status(200).json(new ApiResponse(200, null, "Like removed"));
  } else {
    const newLike = new Like({ tweet: tweetId, likedBy: _id });
    newLike.save();
    return res.status(200).json(new ApiResponse(200, null, "Like added"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const { _id } = req.user;
  if (!_id) throw new ApiError(404, "user id not found");

  const allLikedVideosByUser = await Like.aggregate([
    {
      $match: {
        likedBy: _id,
      },
    },
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
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, allLikedVideosByUser, "all videos fetched"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
