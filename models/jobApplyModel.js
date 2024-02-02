import mongoose from "mongoose";
const JobApplySchema = mongoose.Schema(
  {
    sid: {
      type: String,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
    },
    requestOffer: {
      type: Object,
    },
    requestEstTime: {
      type: Number,
    },
    approveDate: {
      type: Date,
    },
    requestDate: {
      type: Date,
    },
    progress: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
const JobApplyModel = mongoose.model("job_apply", JobApplySchema);
export default JobApplyModel;
