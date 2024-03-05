import mongoose, { isValidObjectId } from "mongoose";
import { Log } from "../models/log.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createLog = asyncHandler(async (req, res) => {
  //TODO: create log

  const owner = req.user?._id;

  const {
    todo,
    rememberTodayBy,
    expences,
    rating,
    surpriceAnswer,
    surpriceQue,
    logDate,
  } = req.body;

  const log = await Log.create({
    todo,
    rememberTodayBy,
    expences,
    rating,
    surpriceAnswer,
    surpriceQue,
    owner,
    logDate,
  });

  if (!log) {
    throw new ApiError(400, "Log creation failed!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, log, "Log created successfully!"));
});

const getUserLogs = asyncHandler(async (req, res) => {
  // TODO: get user logs
  const owner = req.user?._id;

  // const userExist = await Log.findById(userId);

  // if (!userExist) {
  //   throw new ApiError(400, "User does not exist with this ID");
  // }

  const log = await Log.find({ owner });

  if (!log) {
    throw new ApiError(400, "Log not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, log, "Logs feched successfully!"));
});

const updateLog = asyncHandler(async (req, res) => {
  //TODO: update log
  const { logId } = req.params;

  const {
    todo,
    rememberTodayBy,
    expences,
    rating,
    surpriceQue,
    surpriceAnswer,
    logDate,
  } = req.body;

  const log = await Log.findByIdAndUpdate(
    logId,
    {
      $set: {
        todo,
        rememberTodayBy,
        expences,
        rating,
        surpriceQue,
        surpriceAnswer,
        logDate,
      },
    },
    { new: true }
  );

  if (!log) {
    throw new ApiError(400, "Log updation failed!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, log, "Log updated successfully!"));
});

const getUserLogById = asyncHandler(async (req, res) => {
  //TODO: delete log
  const { logId } = req.params;

  const log = await Log.findById(logId);

  if (!log) {
    throw new ApiError(400, "Log by ID fetching failed!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, log, "Log by ID fetched succesfully!"));
});

const deleteLog = asyncHandler(async (req, res) => {
  //TODO: delete log
  const { logId } = req.params;

  const log = await Log.findByIdAndDelete(logId);

  if (!log) {
    throw new ApiError(400, "Log deletion failed!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, log, "Log deleted successfully!"));
});

export { createLog, getUserLogs, updateLog, deleteLog, getUserLogById };
