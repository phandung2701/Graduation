import mongoose from 'mongoose';
const JobSchema = mongoose.Schema(
  {
    sid: {
      type: String,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    user: {
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
    expectedOffer: {
      type: Number,
    },
    type: {
      type: Object,
    },
    estComplete: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);
const JobModel = mongoose.model('Job', JobSchema);
export default JobModel;
