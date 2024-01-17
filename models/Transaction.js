import mongoose from 'mongoose';
const transactionSchema = mongoose.Schema(
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
const transactionModel = mongoose.model('transaction', transactionSchema);
export default transactionModel;
