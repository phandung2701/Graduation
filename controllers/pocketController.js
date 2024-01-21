import pocketModel from '../models/pocket';

export const rechargePocket = async (req, res) => {
  try {
    const { money } = req.body;
    const user = req.rootUserId;

    await pocketModel.updateOne({ user }, { balance: { $inc: Number(money) } });
  } catch (err) {
    return res.status(500).json(err);
  }
};
