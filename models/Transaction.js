import mongoose from 'mongoose';
const transactionSchema = mongoose.Schema(
  {
    sid: {
      type: String,
    },
    amount: {
      type: Number,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
    },
    transType: {
      type: String,
    },
    transDate: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const transactionModel = mongoose.model('transaction', transactionSchema);
export default transactionModel;
