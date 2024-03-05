import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  const like = await Like.find({
    likedBy: req?.user._id,
    video: videoId,
  });

  let message;
  let UpdatedLike;

  if (like.length <= 0) {
    UpdatedLike = await Like.create({
      likedBy: req?.user._id,
      video: videoId,
    });
    message = "Liked to the Video!";
  } else {
    UpdatedLike = await Like.findOneAndDelete({
      likedBy: req?.user._id,
      video: videoId,
    });
    message = "Un-Liked to the Video!";
  }

  if (!UpdatedLike) {
    throw new ApiError(400, "Like process failed!");
  }

  return res.status(200).json(new ApiResponse(200, UpdatedLike, message));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  const like = await Like.find({
    likedBy: req?.user._id,
    comment: commentId,
  });

  let message;
  let UpdatedLike;

  if (like.length <= 0) {
    UpdatedLike = await Like.create({
      likedBy: req?.user._id,
      comment: commentId,
    });
    message = "Liked to the Comment!";
  } else {
    UpdatedLike = await Like.findOneAndDelete({
      likedBy: req?.user._id,
      comment: commentId,
    });
    message = "Un-Liked to the Comment!";
  }

  if (!UpdatedLike) {
    throw new ApiError(400, "Like process failed!");
  }

  return res.status(200).json(new ApiResponse(200, UpdatedLike, message));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  const like = await Like.find({
    likedBy: req?.user._id,
    tweet: tweetId,
  });

  let message;
  let UpdatedLike;

  if (like.length <= 0) {
    UpdatedLike = await Like.create({
      likedBy: req?.user._id,
      tweet: tweetId,
    });
    message = "Liked to the Tweet!";
  } else {
    UpdatedLike = await Like.findOneAndDelete({
      likedBy: req?.user._id,
      tweet: tweetId,
    });
    message = "Un-Liked to the Tweet!";
  }

  if (!UpdatedLike) {
    throw new ApiError(400, "Like process failed!");
  }

  return res.status(200).json(new ApiResponse(200, UpdatedLike, message));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const like = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req?.user._id),
        video: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "videos",
        foreignField: "_id",
        localField: "video",
        as: "video_details",

        pipeline: [
          {
            $project: {
              videoFile: 1,
              thumbnail: 1,
              title: 1,
              description: 1,
              duration: 1,
              views: 1,
              owner: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        video_details: {
          $first: "$video_details",
        },
      },
    },
    {
      $project: {
        createdAt: 1,
        video_details: 1,
      },
    },
  ]);

  if (!like) {
    throw new ApiError(400, "Like process failed!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, like, "Liked Videos fetched successfully!"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
