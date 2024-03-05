import mongoose, { Mongoose, isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  const userExist = await User.findById(channelId);

  if (!userExist) {
    throw new ApiError(400, "User does not exist with this ID");
  }

  const sub = await Subscription.find({
    subscriber: req?.user._id,
    channel: channelId,
  });

  let message;
  let UpdatedSub;

  if (sub.length <= 0) {
    UpdatedSub = await Subscription.create({
      subscriber: req?.user._id,
      channel: channelId,
    });
    message = "Subscribed to the Channel!";
  } else {
    UpdatedSub = await Subscription.findOneAndDelete({
      subscriber: req?.user._id,
      channel: channelId,
    });
    message = "Unsubscribed to the Channel!";
  }

  if (!UpdatedSub) {
    throw new ApiError(400, "Subscription failed!");
  }

  return res.status(200).json(new ApiResponse(200, UpdatedSub, message));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const userExist = await User.findById(channelId);

  if (!userExist) {
    throw new ApiError(400, "User does not exist with this ID");
  }


  const subscribersList = await Subscription.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(channelId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber_details",

        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriber_details: {
          $first: "$subscriber_details",
        },
      },
    },
    {
      $project: {
        subscriber_details: 1,
        _id: 0,
        createdAt: 1,
      },
    },
  ]);

  if (!subscribersList) {
    throw new ApiError(400, "Subscription fetching failed!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subscribersList, "Successfully found list!"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  const userExist = await User.findById(subscriberId);

  if (!userExist) {
    throw new ApiError(400, "User does not exist with this ID");
  }


  const channelList = await Subscription.aggregate([
    {
      $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel_details",

        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        channel_details: {
          $first: "$channel_details",
        },
      },
    },

    {
      $project: {
        createdAt: 1,
        channel_details: 1,
        _id: 0,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, channelList, "Successfully found channel list!")
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
