import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { _id } = req.user;
  //TODO: create playlist
  if (!name || !description || !_id) {
    return new ApiError(404, "all details not found");
  }
  const data = await Playlist.create({
    name,
    description,
    owner: _id,
  });
  return res
    .status(201)
    .json(new ApiResponse(200, data, "playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!userId) throw new ApiError(404, "user id not found");
  const allPlaylistOfUser = await Playlist.find({ owner: userId });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allPlaylistOfUser,
        "all playlist fetched successfully"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId) throw new ApiError(404, "playlist id not found");
  const playlist = await Playlist.findById(playlistId);
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId)
    throw new ApiError(404, "playlist id and video id not found");
  const updatedPlaylist = await Playlist.updateOne(
    { _id: playlistId },
    { $push: { videos: videoId } }
  );
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "video added to playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!playlistId || !videoId)
    throw new ApiError(404, "playlist id and video id not found");
  const updatedPlaylist = await Playlist.updateOne(
    { _id: playlistId },
    { $pull: { videos: videoId } },
    { new: true }
  );
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "video removed from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId) throw new ApiError(404, "playlist id not found");
  await Playlist.findByIdAndDelete(playlistId);
  return res
    .status(200)
    .json(new ApiResponse(200, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  const documentToUpdate = {
    ...(name && { name }),
    ...(description && { description }),
  };
  if (!playlistId || !(name || description))
    throw new ApiError(404, "playlist id, name and description not found");
  const updatedPlaylist = await Playlist.updateOne(
    { _id: playlistId },
    {
      $set: documentToUpdate,
    },
    { new: true }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
