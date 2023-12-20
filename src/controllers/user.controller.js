import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

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

export { registerUser };
