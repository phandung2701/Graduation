import express from "express";
import { Auth } from "../middleware/user.js";
const router = express.Router();

import {
  createJob,
  findAllJobs,
  findJobsByUser,
  updateJob,
  deleteJob,
  applyJob,
  approveJob,
  findJobsApply,
  applicationList,
} from "../controllers/jobController.js";

router.post("/approve", Auth, approveJob);
router.post("/applicationList", Auth, applicationList);

router.post("/apply", Auth, applyJob);
router.post("/listJobApply", Auth, findJobsApply);

router.post("/update", Auth, deleteJob);
router.post("/update", Auth, updateJob);
router.post("/create", Auth, createJob);
router.get("/myJob", Auth, findJobsByUser);
router.post("/", findAllJobs);

export default router;
