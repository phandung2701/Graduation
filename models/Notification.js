import mongoose from 'mongoose';
const notificationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sendTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: {
      type: String,
    },
    sid: {
      type: String,
    },
    title: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
const notificationModel = mongoose.model('Notification', notificationSchema);
export default notificationModel;
