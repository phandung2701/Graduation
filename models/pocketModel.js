import mongoose from 'mongoose';
const pocketSchema = mongoose.Schema(
  {
    sid: {
      type: String,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      default: 'active',
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
const pocketModel = mongoose.model('Pocket', pocketSchema);
export default pocketModel;
