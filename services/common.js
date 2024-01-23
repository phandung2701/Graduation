import moment from "moment";
import Notification from "../models/Notification.js";
import Transaction from "../models/Transaction.js";

const common = {};

common.createDigitsCode = (length) => {
  let dateFactor = (
    "000" +
    moment().diff(moment(new Date(2018, 0, 0, 0, 0, 0, 0)), "milliseconds")
  ).slice(-(length || 15));
  return "" + dateFactor;
};

common.convertWordToMoney = (value) => {
  let splitString = `${value}`.split(".");
  let naturalPart = splitString[0];
  let decimalPart = splitString[1];
  if (decimalPart) decimalPart = `.${decimalPart.substring(0, 2)}`;
  return `${naturalPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${
    decimalPart || ""
  }`;
};

common.notificationTransfer = async (sender, receiver, amount) => {
  await Notification.create({
    sid: common.createDigitsCode(16),
    sendTo: sender._id,
    user: sender._id,
    title: "Transfer Money",
    content: `You just transferred ${amount} to ${receiver.name}`,
  });
  await Notification.create({
    sid: common.createDigitsCode(16),
    sendTo: sender._id,
    user: receiver._id,
    title: "Transfer Money",
    content: `You get ${amount} from ${sender.name}`,
  });
};

common.notification = async ({ title, content, user }) => {
  await Notification.create({
    sid: common.createDigitsCode(16),
    sendTo: user,
    user: user,
    title: title,
    content: content,
  });
};

common.transaction = async (data = {}) => {
  await Transaction.create({
    sid: common.createDigitsCode(16),
    amount: data.amount,
    senderId: data.senderId,
    receiverId: data.receiverId,
    status: "done",
    transType: "normal",
    transDate: new Date(),
  });
};

export default common;
