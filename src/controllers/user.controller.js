import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Refresh & Access Token!"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // 1. Get User Details from Front End
  // 2. Validation of the User Details… (Not empty , Check email format)
  // 3. Check if user already exists : (username, email)
  // 4. Check for images (Avatar)
  // 5. Upload them to Cloudinary (Get the URL)
  // 6. Create user Obj : (Create entry in db)
  // 7. Remove the suspecious fields from the Response to user (Password , Refresh Token)
  // 8. Check if user is created
  // 9. return response!

  const { fullName, email, username, password } = req.body;

  // 1) 2)
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required!");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });

  // 3)
  if (existedUser) {
    throw new ApiError(409, "User with email or password already exists!");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  // 4)
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required!");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // 5)
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required!");
  }

  // 6)
  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar?.url,
    coverImage: coverImage?.url || "",
  });

  // 7) 8)

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user!");
  }

  // 9)
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully!"));
});

const loginUser = asyncHandler(async (req, res) => {
  /* 
  1. Take Data from req.body
  2. Validate Username / email
  3. Search the User 
  4. If user found, check the Password
  5. If Password is Correct, Generate access & refresh Token
  6. Send Token in Cookie 
  */

  //1)
  const { username, email, password } = req.body;

  //2)
  if (!username && !email) {
    throw new ApiError(400, "username or password is not send!");
  }
  //3)
  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw new ApiError(404, "user does not exist!");
  }

  //4)
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials!");
  }

  //5)
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //5)
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User loggedin successfully!"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged out Successfully!"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request!");
  }

  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token!");
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is Expired or Used!");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshTOken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshTOken, options)
      .json(
        new ApiResponse(200),
        {
          accessToken,
          refreshToken: newRefreshTOken,
        },
        "Access Token generated successfully!"
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh token!");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
