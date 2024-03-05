import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteImgOnCloudinary,
  deleteVideoOnCloudinary,
  uploadImgOnCloudinary,
  uploadVideoOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 0, limit = 5, search = "", userId } = req.query;
  let sort = req.query.sort || "createdAt";

  //TODO: get all videos based on query, sort, pagination

  req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

  let sortBy = {};
  if (sort[1] === "desc") {
    sortBy[sort[0]] = -1;
  } else {
    sortBy[sort[0]] = 1;
  }

  const regexObj = userId
    ? ({
        title: { $regex: search, $options: "i" },
      },
      { owner: new mongoose.Types.ObjectId(userId) })
    : {
        title: { $regex: search, $options: "i" },
      };

  const videos = await Video.find(regexObj)
    .sort(sortBy)
    .skip(page * limit)
    .limit(limit);

  const total = await Video.countDocuments(regexObj);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, `Total Videos found ${total}`));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  const userId = req.user?._id;

  const videoFileLocalPath = req.files?.videoFile[0].path;
  const thumbnailLocalPath = req.files?.thumbnail[0].path;

  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video file or thumbnail not found!");
  }

  if (!title || !description) {
    throw new ApiError(400, "Title or desctiption of video are required!");
  }

  const videoFile = await uploadVideoOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadImgOnCloudinary(thumbnailLocalPath);

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: videoFile.duration,
    owner: userId,
    isPublished: true,
  });

  if (!video) {
    throw new ApiError(400, "Something went wrong, video upload failed!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video uploaded successfully!"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  const userId = req.user?._id;

  console.log("videoId", videoId);
  const [video] = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",

        pipeline: [
          {
            $project: {
              // userId: "$_id",
              username: 1,
              avatar: 1,
              fullName: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        isViewed: {
          $cond: {
            if: { $in: [userId, "$views"] },
            then: true,
            else: false,
          },
        },
      },
    },
  ]);
  console.log("isViewed", video.isViewed);

  if (!video) {
    throw new ApiError(401, "No video found!");
  }

  const newVideo = !video.isViewed
    ? await Video.findByIdAndUpdate(
        videoId,
        { $push: { views: userId } },
        { new: true }
      )
    : video;

  if (!newVideo) {
    throw new ApiError(401, "No video found !!");
  }

  // console.log("newVideo", newVideo.videoFile.split("."));

  await User.findByIdAndUpdate(userId, { $push: { watchHistory: videoId } });

  return res
    .status(200)
    .json(new ApiResponse(200, newVideo, "Video fetched successfully!"));
});

const updateVideoDetails = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  const { title, description } = req.body;

  console.log("title", title, "description", description, "videoId", videoId);

  if (!title || !description) {
    throw new ApiError(400, "Title or description  not found!");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
      },
    },
    { new: true }
  );

  if (!video) {
    throw new ApiError(
      400,
      "something went wrong while updating video details!"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(201, video, "Video details updated successfully!"));
});

const updateVideoThumbnail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found with this ID!");
  }

  const thumbnailLocalPath = req.file?.path;

  const thumbnail = await uploadImgOnCloudinary(thumbnailLocalPath);

  if (!thumbnail.url) {
    throw new ApiError(401, "Error while uploading thumbnail on Clodinary!");
  }

  const ThumbnailId = video.thumbnail.split("/").at(-1).split(".")[0];

  const deletedThumbnail = await deleteImgOnCloudinary(ThumbnailId);

  console.log("ID's", deletedThumbnail);

  const videoRes = await Video.findByIdAndUpdate(
    videoId,
    { $set: { thumbnail: thumbnail.url } },
    { new: true }
  );

  if (!videoRes) {
    throw new ApiError(400, "video not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video thumbnail Updated successfully!"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found with this ID!");
  }

  const VideoId = video.videoFile.split("/").at(-1).split(".")[0];
  const ThumbnailId = video.thumbnail.split("/").at(-1).split(".")[0];

  console.log("ID's", VideoId, ThumbnailId);

  const deletedVideo = await deleteVideoOnCloudinary(VideoId);
  const deletedThumbnail = await deleteImgOnCloudinary(ThumbnailId);

  console.log("ID's", deletedVideo, deletedThumbnail);

  const deletedItem = await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedItem, "Video deleted successfully!"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findByIdAndUpdate(
    videoId,
    [{ $set: { isPublished: { $not: "$isPublished" } } }],
    { new: true }
  );

  if (!video) {
    throw new ApiError(
      400,
      "something went wrong while updating video publish status!"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(201, video, "Video pulished status updated successfully!")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideoDetails,
  updateVideoThumbnail,
  deleteVideo,
  togglePublishStatus,
};
