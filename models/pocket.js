import mongoose from 'mongoose';
const pocketSchema = mongoose.Schema(
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
const pocketModel = mongoose.model('Job', pocketSchema);
export default pocketModel;
