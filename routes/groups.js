import { Router } from "express";
import {
  createGroup,
  deleteGroup,
  getGroup,
  listGroups,
} from "../controllers/groupsController.js";
import findGroup from "../middleware/findGroup.js";
import validateGroup from "../middleware/validateGroup.js";

const router = Router();

router.get("/", listGroups);
router.get("/:id", findGroup, getGroup);
router.post("/", validateGroup, createGroup);
router.delete("/:id", findGroup, deleteGroup);

export default router;
