import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 0, limit = 2 } = req.query;

  const comment = await Comment.find({ video: videoId })
    .skip(page * limit)
    .limit(limit);

  if (!comment) {
    throw new ApiError(400, "Comment not found!");
  }

  const total = await Comment.countDocuments({ video: videoId });

  return res
    .status(200)
    .json(new ApiResponse(200, comment, `Total comments ${total}`));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const { content } = req.body;
  const video = req.params.videoId;

  const comment = await Comment.create({
    content,
    video,
    owner: req.user?._id,
  });

  if (!comment) {
    throw new ApiError(400, "Comment not created!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment created successfully!"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment

  const { content } = req.body;
  const { commentId } = req.params;

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: { content },
    },
    { new: true }
  );

  if (!comment) {
    throw new ApiError(400, "Comment not updated!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully!"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment

  const { commentId } = req.params;

  const comment = await Comment.findByIdAndDelete(commentId);

  if (!comment) {
    throw new ApiError(400, "Comment not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment deleted successfully!"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
