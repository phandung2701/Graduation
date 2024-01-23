import Job from "../models/jobModel.js";
import JobApply from "../models/jobApplyModel.js";
import common from "../services/common.js";
import Notification from "../models/Notification.js";
import Pocket from "../models/pocketModel.js";
import constant from "../services/constant.js";
import userModel from "../models/userModel.js";
import moment from "moment";

export const findAllJobs = async (req, res) => {
  try {
    const { title, expectedOffer } = req.body;
    let options = {
      status: { $nin: ["deleted", "inactive"] },
    };
    if (title) {
      options.title = {
        $regex: new RegExp(title, "i"),
      };
    }
    if (expectedOffer) {
      options.expectedOffer = expectedOffer;
    }
    const jobs = await Job.find(options).populate("user").sort({ _id: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
};

export const findJobsByUser = async (req, res) => {
  try {
    const user = req.rootUserId;
    if (!user) return res.send({ message: "Provide User's Id" });

    const jobs = await Job.find({ user: user, status: { $ne: "deleted" } })
      .populate("user")
      .sort({ _id: -1 });
    return res.status(200).json(jobs);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

export const findJobsApply = async (req, res) => {
  try {
    const user = req.rootUserId;
    if (!user) return res.send({ message: "Provide User's Id" });

    let jobs = await JobApply.find({ user: user, status: { $ne: "deleted" } })
      .populate("user")
      .populate("job")
      .sort({ _id: -1 });
    jobs = jobs.map((job) => {
      if (job.approveDate) {
        let progress = moment(new Date()).diff(moment(job.approveDate), "days");
        job["progress"] = Number(progress) / Number(job.requestEstTime);
      }
      return job;
    });
    return res.status(200).json(jobs);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

export const createJob = async (req, res) => {
  const {
    title,
    description,
    status = "active",
    detail,
    expireDate,
    expectedOffer,
    type,
    estComplete,
  } = req.body;
  const user = req.rootUserId;
  if (!title || !description || !expireDate || !expectedOffer || !estComplete)
    res.send({ message: "Provide User's Id" });
  try {
    const createJob = {
      sid: common.createDigitsCode(16),
      user: String(user),
      title: title,
      description: description,
      status: status,
      detail: detail,
      expireDate: expireDate,
      expectedOffer: expectedOffer,
      type: type,
      estComplete: estComplete,
    };
    await Job.create(createJob);

    return res.status(200).json("Create Job success!");
  } catch (error) {
    return res.status(500).send(error);
  }
};

export const updateJob = async (req, res) => {
  const {
    sid,
    title,
    description,
    status,
    detail,
    expireDate,
    expectedOffer,
    type,
    estComplete,
  } = req.body;
  if (!sid) return res.send({ message: "Job not found" });
  try {
    const createJob = {
      title: title,
      description: description,
      status: status,
      detail: detail,
      expireDate: expireDate,
      expectedOffer: expectedOffer,
      type: type,
      estComplete: estComplete,
    };
    const filteredCreateJob = Object.fromEntries(
      Object.entries(createJob).filter(
        ([key, value]) => value !== undefined && value !== null && value !== ""
      )
    );
    await Job.update({ sid: sid }, filteredCreateJob);

    return res.status(200).json("Update Job success!");
  } catch (error) {
    return res.status(500).send(error);
  }
};

export const deleteJob = async (req, res) => {
  const { sid } = req.body;
  if (!sid) return res.send({ message: "Job not found" });
  try {
    let job = await Job.findOneAndUpdate(
      { sid: sid },
      { status: "deleted" },
      { new: true }
    );

    return res.status(200).json("delete Job success!");
  } catch (error) {
    return res.status(500).send(error);
  }
};

export const applyJob = async (req, res) => {
  const { jobId, requestOffer, requestEstTime } = req.body;
  const user = req.rootUserId;

  if (!jobId || !String(user)) return res.send({ message: "Job not found" });
  try {
    let checkJob = await Job.findOne({ _id: jobId, status: "active" });
    if (!checkJob) return res.status(401).json("Job not exist");
    let checkJobApply = await JobApply.findOne({
      job: jobId,
      user: user,
      status: { $ne: "reject" },
    });
    if (checkJobApply) return res.status(401).json("You have apply it");
    let options = {
      sid: common.createDigitsCode(16),
      job: jobId,
      user: String(user),
      requestOffer: requestOffer,
      requestEstTime: requestEstTime,
      requestDate: new Date(),
      status: "pending",
    };
    await JobApply.create(options);
    let userInfo = await userModel.findOne({ _id: user });
    await Notification.create({
      sid: common.createDigitsCode(16),
      sendTo: user,
      user: checkJob.user,
      title: "Apply Job",
      content: `${userInfo.name} just applied to the [JOB-${checkJob.sid}] you posted`,
    });
    return res.status(200).json("Apply Job success!");
  } catch (error) {
    return res.status(500).send(error);
  }
};
export const applicationList = async (req, res) => {
  const { jobId } = req.body;
  const user = req.rootUserId;

  if (!jobId || !String(user)) return res.send({ message: "Job not found" });
  try {
    let list = await JobApply.find({
      job: jobId,
    });

    return res.status(200).json({ data: list });
  } catch (error) {
    return res.status(500).send(error);
  }
};

export const approveJob = async (req, res) => {
  const { jobApplyId } = req.body;

  const userApply = req.rootUserId;

  try {
    if (!jobApplyId) return res.status(401).json("Job not found");

    let jobApprove = await JobApply.findOne({
      _id: jobApplyId,
      status: "pending",
    });
    if (!jobApprove) return res.status(401).json("Job not found");

    let transfer = await transferMoney(
      jobApprove.user,
      "ADMIN",
      Number(jobApprove.requestOffer) + constant.FEE
    );
    if (transfer.err !== 0) return res.status(401).json(transfer.msg);

    await JobApply.updateOne(
      { _id: jobApplyId },
      { status: "inProgress", approveDate: new Date() }
    );
    await Notification.create({
      sid: common.createDigitsCode(16),
      sendTo: userApply,
      user: JobApply.user,
      title: "Approve Job",
      content: `Your application for [JOB-${JobApply.sid}] has been approve`,
    });
    await Job.updateOne({ _id: jobApprove.job }, { status: "inactive" });

    await JobApply.updateMany(
      {
        job: jobApprove.job,
        user: jobApprove.user,
        _id: { $ne: jobApplyId },
      },
      { $set: { status: "reject" } }
    );
    let updatedRecords = await JobApply.find({
      job: jobApprove.job,
      user: jobApprove.user,
      _id: { $ne: jobApplyId },
    });
    const promises = updatedRecords.map(async (jobApply) => {
      await Notification.create({
        sid: common.createDigitsCode(16),
        sendTo: userApply,
        user: jobApply.user,
        title: "Reject Job",
        content: `Your application for [JOB-${jobApply.sid}] has been rejected`,
      });
    });

    await Promise.all(promises);
    return res.status(200).json("Apply Job success!");
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

const transferMoney = async (sender, receiver, amount) => {
  // const session = await Pocket.startSession();
  // session.startTransaction();

  try {
    if (Number(amount) <= 0) {
      throw {
        err: 500,
        msg: "Invalid amount. Amount should be greater than 0.",
      };
    }

    const getActivePocket = async (user) => {
      if (user === "ADMIN") {
        return await Pocket.findOne({
          user: constant.POCKET_ADMIN,
          status: "active",
        }).populate("user"); //.session(session);
      } else {
        return await Pocket.findOne({ user, status: "active" }).populate(
          "user"
        ); //.session(session);
      }
    };

    const senderPocket = await getActivePocket(sender);
    const receiverPocket = await getActivePocket(receiver);

    if (!senderPocket || senderPocket.balance < amount) {
      throw { err: 500, msg: "Insufficient balance for the sender." };
    }
    common.transaction({
      amount: amount,
      receiverId: receiverPocket.user._id,
      senderId: senderPocket.user._id,
    });
    await Pocket.updateOne(
      { _id: senderPocket._id },
      { $inc: { balance: -Number(amount) } }
    ); //.session(session);

    //push noti
    await common.notificationTransfer(
      senderPocket.user,
      receiverPocket.user,
      amount
    );

    await Pocket.updateOne(
      { _id: receiverPocket._id },
      { $inc: { balance: Number(amount) } }
    ); //.session(session);

    // await session.commitTransaction();
    // session.endSession();

    return { err: 0, msg: "Transaction successful." };
  } catch (err) {
    // await session.abortTransaction();
    // session.endSession();

    return { err: 500, msg: err.msg || "Internal server error occurred." };
  }
};
