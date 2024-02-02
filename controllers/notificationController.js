import notificationModel from "../models/Notification.js";
import pocketModel from "../models/pocketModel.js";
import common from "../services/common.js";

export const getAllNotification = async (req, res) => {
  try {
    let notifications = await notificationModel
      .find()
      .sort({ _id: -1 })
      .populate("user")
      .populate("sendTo");
    return res.status(200).json({ notifications });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json(err);
  }
};

export const getNotificationByUser = async (req, res) => {
  try {
    const user = req.rootUserId;
    if (!user) return res.status(401).json("User not exist");
    let notifications = await notificationModel
      .find({ user: user })
      .populate("user")
      .populate("sendTo")
      .sort({ _id: -1 });
    return res.status(200).json(notifications);
  } catch (err) {
    return res.status(500).json(err);
  }
};
