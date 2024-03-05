import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(400, "Error occured while creation of playlist!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully!"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  const userExist = await User.findById(channelId);

  if (!userExist) {
    throw new ApiError(400, "User does not exist with this ID");
  }

  const playlist = await Playlist.find({ owner: userId });

  if (!playlist) {
    throw new ApiError(
      400,
      "Error occured while fetching of playlist by UserId!"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Playlist by UserId fetched successfully!")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(
      400,
      "Error occured while fetching of playlist by PlaylistId!"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "Playlist by PlaylistId fetched successfully!"
      )
    );
});
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { videos: videoId } },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(400, "Error occured while adding video to playlist!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to Playlist successfully!")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(
      400,
      "Error occured while deleting video from playlist!"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video removed to Playlist successfully!")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  const playlist = await Playlist.findByIdAndDelete(playlistId);

  if (!playlist) {
    throw new ApiError(400, "Error occured while deletion of playlist!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist deleted successfully!"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(400, "Error occured while updation of playlist!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully!"));
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
