import mongoose from 'mongoose';
const activityShema = mongoose.Schema(
  {
    action: {
      type: String,
    },
    sid: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
    },
    meta: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);
const activityModel = mongoose.model('Activity', activityShema);
export default activityModel;
