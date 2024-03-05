import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet

  const owner = req.user?._id;

  const { content } = req.body;

  const tweet = await Tweet.create({
    content,
    owner,
  });

  if (!tweet) {
    throw new ApiError(400, "Tweet creation failed!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully!"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  const userExist = await User.findById(userId);

  if (!userExist) {
    throw new ApiError(400, "User does not exist with this ID");
  }

  const tweet = await Tweet.find({ owner: userId });

  if (!tweet) {
    throw new ApiError(400, "Tweet not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweets feched successfully!"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;

  const { content } = req.body;

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: { content },
    },
    { new: true }
  );

  if (!tweet) {
    throw new ApiError(400, "Tweet updation failed!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully!"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  const tweet = await Tweet.findByIdAndDelete(tweetId);

  if (!tweet) {
    throw new ApiError(400, "Tweet deletion failed!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet deleted successfully!"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
