import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const [totalViews] = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    { $unwind: "$views" },
    { $group: { _id: "$_id", sum: { $sum: 1 } } },
    { $group: { _id: null, total_views: { $sum: "$sum" } } },
    {
      $project: { total_views: 1, _id: 0 },
    },
  ]);

  const totalVideos = await Video.countDocuments({
    owner: new mongoose.Types.ObjectId(req.user?._id),
  });

  const totalSubscribers = await Subscription.countDocuments({
    channel: new mongoose.Types.ObjectId(req.user?._id),
  });
  const totalChannelSubscribed = await Subscription.countDocuments({
    subscriber: new mongoose.Types.ObjectId(req.user?._id),
  });

  const [totalLikes] = await Like.aggregate([
    {
      $match: {
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
            $match: {
              owner: new mongoose.Types.ObjectId(req.user?._id),
            },
          },
        ],
      },
    },
    {
      $count: "totalLikes",
    },
  ]);

  const stats = {
    totalViews: totalViews?.total_views || 0,
    totalLikes: totalLikes?.totalLikes,
    totalVideos: totalVideos,
    totalSubscribers: totalSubscribers,
    totalChannelSubscribed: totalChannelSubscribed,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "All stats fetched successfully!"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  const allVideos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        foreignField: "_id",
        localField: "video",
        as: "video_details",
      },
    },
  ]);

  if (!allVideos) {
    throw new ApiError(400, "Error occured while fetching all videos!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, allVideos, "All videos fetched successfully!"));
});

export { getChannelStats, getChannelVideos };
