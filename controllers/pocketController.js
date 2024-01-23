import pocketModel from "../models/pocketModel.js";
import common from "../services/common.js";

export const rechargePocket = async (req, res) => {
  try {
    const { money } = req.body;
    const user = req.rootUserId;
    if (!user) return res.status(401).json("User not exist");
    await pocketModel.updateOne({ user }, { $inc: { balance: Number(money) } });
    common.transaction({ amount: money, receiverId: user, senderId: user });
    common.notification({
      title: "Account balance changes",
      content: `You have successfully deposited ${common.convertWordToMoney(
        money
      )}$ into your account.`,
      user: user,
    });
    return res.status(200).json("recharge pocket success");
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

export const withDrawMoney = async (req, res) => {
  try {
    const { money } = req.body;
    const user = req.rootUserId;
    if (!user) return res.status(401).json("User not exist");

    await pocketModel.updateOne(
      { user },
      { $inc: { balance: Number(-money) } }
    );
    common.transaction({ amount: money, receiverId: user, senderId: user });
    common.notification({
      title: "Account balance changes",
      content: `You have successfully withdrawn ${common.convertWordToMoney(
        money
      )}$.`,
      user: user,
    });

    return res.status(200).json("WithDraw Money pocket success");
  } catch (err) {
    return res.status(500).json(err);
  }
};
