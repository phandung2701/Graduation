import express from "express";
import { Auth } from "../middleware/user.js";
const router = express.Router();

import {
  rechargePocket,
  withDrawMoney,
} from "../controllers/pocketController.js";

router.post("/recharge", Auth, rechargePocket);
router.post("/withDraw", Auth, withDrawMoney);

export default router;
