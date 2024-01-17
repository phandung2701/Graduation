import mongoose from 'mongoose';
const JobApplySchema = mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: Boolean,
      default: false,
    },
    users: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
    },
    detail: {
      type: Object,
    },
    expireDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);
const JobApplyModel = mongoose.model('job_apply', JobApplySchema);
export default JobApplyModel;
