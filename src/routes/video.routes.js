import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideoDetails,
  updateVideoThumbnail,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/")
  .get(getAllVideos)
  .post(
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishAVideo
  );

router.route("/:videoId").get(getVideoById).delete(deleteVideo);

router.route("/:videoId/update-details").patch(updateVideoDetails);

router
  .route("/:videoId/update-thumbnail")
  .patch(upload.single("thumbnail"), updateVideoThumbnail);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
