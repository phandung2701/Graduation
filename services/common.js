import moment from 'moment';
import Notification from '../models/Notification.js';

const common = {};

common.createDigitsCode = (length) => {
  let dateFactor = (
    '000' +
    moment().diff(moment(new Date(2018, 0, 0, 0, 0, 0, 0)), 'milliseconds')
  ).slice(-(length || 15));
  return '' + dateFactor;
};

common.notificationTransfer = async (sender, receiver, amount) => {
  await Notification.create({
    sid: common.createDigitsCode(16),
    sendTo: sender._id,
    user: sender._id,
    title: 'Transfer Money',
    content: `You just transferred ${amount} to ${receiver.name}`,
  });
  await Notification.create({
    sid: common.createDigitsCode(16),
    sendTo: sender._id,
    user: receiver._id,
    title: 'Transfer Money',
    content: `You get ${amount} from ${sender.name}`,
  });
};

export default common;
