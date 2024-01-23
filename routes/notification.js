import express from "express";
import { Auth } from "../middleware/user.js";
const router = express.Router();

import {
  getAllNotification,
  getNotificationByUser,
} from "../controllers/notificationController.js";

router.get("/", Auth, getAllNotification);
router.post("/list", Auth, getNotificationByUser);

export default router;
