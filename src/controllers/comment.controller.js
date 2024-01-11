import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { _id } = req.user;
  if (!videoId || !_id) return new ApiError(404, "video id not found");
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const comments = await Comment.find({ video: videoId, owner: _id })
    .skip(skip)
    .limit(limit);
  return res
    .status(200)
    .json(new ApiResponse(200, comments, "all comments fetched"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  const { _id } = req.user;
  if (!videoId) return new ApiError(404, "Video Id not found");

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: _id,
  });
  return res
    .status(201)
    .json(new ApiResponse(200, comment, "Comment posted successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;
  if (!commentId || !content) return new ApiError(404, "comment id not found");
  const updatedComment = await Comment.updateOne(
    { _id: commentId },
    { $set: { content } },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment Updated"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!commentId) return new ApiError(404, "comment id not found");
  await Comment.findOneAndDelete({ _id: commentId });
  return res.status(200).json(new ApiResponse(200, null, "Comment Deleted"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
