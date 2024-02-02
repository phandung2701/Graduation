import user from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import pocketModel from "../models/pocketModel.js";
import common from "../services/common.js";
import activityModel from "../models/activityModel.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await user.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already Exits" });

    const newuser = new user({
      email,
      password,
      name: name,
      sid: common.createDigitsCode(16),
    });

    const token = await newuser.generateAuthToken();

    await activityModel.create({
      sid: common.createDigitsCode(16),
      action: "Register User",
      meta: newuser,
    });
    let userCreate = await user.create(newuser);

    await pocketModel.create({
      sid: common.createDigitsCode(16),
      user: userCreate._id,
    });

    res.json({ message: "success", token: token });
  } catch (error) {
    console.log("Error in register " + error);
    res.status(500).send(error);
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const valid = await user.findOne({ email });
    if (!valid) res.status(200).json({ message: "User dont exist" });
    const validPassword = await bcrypt.compare(password, valid.password);
    if (!validPassword) {
      res.status(200).json({ message: "Invalid Credentials" });
    } else {
      const token = await valid.generateAuthToken();
      await valid.save();
      res.cookie("userToken", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ token: token, status: 200 });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
export const validUser = async (req, res) => {
  try {
    const validuser = await user
      .findOne({ _id: req.rootUserId })
      .select("-password");
    if (!validuser) return res.json({ message: "user is not valid" });
    let pocket = await pocketModel.findOne({
      status: "active",
      user: String(validuser._id),
    });
    console.log(validuser);
    return res.status(201).json({
      user: validuser,
      balance: common.convertWordToMoney(pocket.balance || 0),
      token: req.token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
};
export const googleAuth = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const client = new OAuth2Client(process.env.CLIENT_ID);
    const verify = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.CLIENT_ID,
    });
    const { email_verified, email, name, picture } = verify.payload;
    if (!email_verified) res.json({ message: "Email Not Verified" });
    const userExist = await user.findOne({ email }).select("-password");
    if (userExist) {
      res.cookie("userToken", tokenId, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ token: tokenId, user: userExist });
    } else {
      const password = email + process.env.CLIENT_ID;
      const newUser = await user({
        name: name,
        profilePic: picture,
        password,
        email,
      });
      await newUser.save();
      res.cookie("userToken", tokenId, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res
        .status(200)
        .json({ message: "User registered Successfully", token: tokenId });
    }
  } catch (error) {
    res.status(500).json({ error: error });
    console.log("error in googleAuth backend" + error);
  }
};

export const logout = (req, res) => {
  req.rootUser.tokens = req.rootUser.tokens.filter((e) => e.token != req.token);
};
export const searchUsers = async (req, res) => {
  // const { search } = req.query;
  const search = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await user.find(search).find({ _id: { $ne: req.rootUserId } });
  res.status(200).send(users);
};
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const selectedUser = await user.findOne({ _id: id }).select("-password");
    res.status(200).json(selectedUser);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
export const updateInfo = async (req, res) => {
  const { id } = req.params;
  const { bio, name } = req.body;
  const updatedUser = await user.findByIdAndUpdate(id, { name, bio });
  return updatedUser;
};

export const createUser = async (req, res) => {
  try {
    const userId = req.rootUserId;
    const { name, email } = req.body;
    if (!email || !name)
      return res.status(401).json("Please fill in all fields");
    let userExist = await user.find({ email });
    if (userExist.length > 0) return res.status(401).json("User is exist");
    // generate password
    let password = Math.random().toString(36).slice(-8).toUpperCase();

    let options = {
      sid: common.createDigitsCode(16),
      name: name,
      email: email,
      password: password,
    };
    await activityModel.create({
      sid: common.createDigitsCode(16),
      action: "Create User",
      user: userId,
      meta: options,
    });
    let userCreate = await user.create(options);

    await pocketModel.create({
      sid: common.createDigitsCode(16),
      user: userCreate._id,
    });

    return res.status(200).json("Create user success");
  } catch (err) {
    return res.status(500).send(err);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { _id, oldPass, newPass } = req.body;
    console.log(_id);
    if (!_id) return res.status(401).json("Invalid User");
    let valid = await user.findOne({ _id: _id });
    const validPassword = await bcrypt.compare(oldPass, valid.password);
    if (!validPassword)
      return res.status(200).json({ message: "Invalid Credentials" });

    await user.updateOne(
      { _id: _id },
      { password: await bcrypt.hash(newPass, 12) }
    );

    return res.status(200).json("Change password success");
  } catch (err) {
    return res.status(500).send(err);
  }
};

export const updatePermission = async (req, res) => {
  try {
    const { _id, role } = req.body;
    if (!_id) return res.status(401).json("Invalid User");

    await user.updateOne({ _id: _id }, { role: role });

    return res.status(200).json("update permission success");
  } catch (err) {
    return res.status(500).send(err);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { sid } = req.body;

    await user.updateOne({ sid: sid }, { status: "deleted" });

    return res.status(200).json("Create user success");
  } catch (err) {
    return res.status(500).send(err);
  }
};

export const findUsers = async (req, res) => {
  try {
    const listUser = await user.find({ status: { $ne: "deleted" } });

    return res.status(200).json(listUser);
  } catch (err) {
    return res.status(500).send(err);
  }
};
