import Transaction from "../models/Transaction.js";

export const getAllTransaction = async (req, res) => {
  try {
    let transactions = await Transaction.find()
      .sort({ _id: -1 })
      .populate("receiverId")
      .populate("senderId");

    return res.status(200).json({ transactions });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json(err);
  }
};

export const getTransactionByUser = async (req, res) => {
  try {
    const user = req.rootUserId;
    if (!user) return res.status(401).json("User not exist");
    let transactions = await Transaction.find({
      $or: [{ receiverId: user }, { senderId: user }],
    })
      .populate("receiverId")
      .populate("senderId")
      .sort({ _id: -1 });
    return res.status(200).json(transactions);
  } catch (err) {
    return res.status(500).json(err);
  }
};
