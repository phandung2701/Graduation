import express from "express";
import { Auth } from "../middleware/user.js";
const router = express.Router();

import {
  getAllTransaction,
  getTransactionByUser,
} from "../controllers/transactionController.js";

router.get("/", Auth, getAllTransaction);
router.post("/list", Auth, getTransactionByUser);

export default router;
