import { Router } from "express";
import {
  createContribution,
  listContributions,
} from "../controllers/contributionsController.js";
import { requireGroup } from "../middleware/findGroup.js";
import findGroup from "../middleware/findGroup.js";
import validateContribution from "../middleware/validateContribution.js";

const router = Router();

router.get("/", findGroup, listContributions);
router.post("/", requireGroup, validateContribution, createContribution);

export default router;
