import { Router } from "express";
import {
  createLog,
  getUserLogs,
  getUserLogById,
  updateLog,
  deleteLog,
} from "../controllers/log.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createLog);
router.route("/user").get(getUserLogs);
router.route("/:logId").get(getUserLogById).patch(updateLog).delete(deleteLog);

export default router;
