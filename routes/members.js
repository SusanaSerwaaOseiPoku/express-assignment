import { Router } from "express";
import {
  createMember,
  deleteMember,
  listMembers,
  updateMember,
} from "../controllers/membersController.js";
import { requireGroup } from "../middleware/findGroup.js";
import findGroup from "../middleware/findGroup.js";
import validateMember from "../middleware/validateMember.js";

const router = Router();

router.get("/", findGroup, listMembers);
router.post("/", validateMember, requireGroup, createMember);
router.patch("/:id", updateMember);
router.delete("/:id", deleteMember);

export default router;
