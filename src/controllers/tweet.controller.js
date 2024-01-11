import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  const { _id } = req.user;
  if (!content || !_id) return new ApiError(500, "Tweet Content is required");
  const user = User.findById(_id);
  if (!user) return new ApiError(404, "No user found");
  const tweet = await Tweet.create({ content, owner: _id });
  return res
    .status(201)
    .json(new ApiResponse(200, tweet, "Tweet Stored Successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  if (!userId) return new ApiError(400, "User Id is required");
  try {
    const allTweets = await Tweet.find({ owner: userId });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          allTweets,
          "All user tweets retrieved successfully"
        )
      );
  } catch (err) {
    console.log(err);
    return new ApiError(400, "User Id is required");
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;
  if (!tweetId)
    return new ApiError(404, "Tweet id and Tweet content not found");
  const updatedTweet = await Tweet.updateOne(
    { _id: tweetId },
    { $set: { content } },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  if (!tweetId) return new ApiError(404, "Tweet Id not found");
  try {
    await Tweet.deleteOne({ _id: tweetId });
    return res.status(204).json(new ApiResponse(200, null));
  } catch (err) {
    console.log(err);
    return new ApiError(400, "Tweet Id is required");
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
