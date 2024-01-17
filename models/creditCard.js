import mongoose from 'mongoose';
const creditCardSchema = mongoose.Schema(
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
const creditCardModel = mongoose.model('creditCard', creditCardSchema);
export default creditCardModel;
