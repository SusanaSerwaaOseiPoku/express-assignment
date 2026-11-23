import { findById } from "../data/store.js";
import { createHttpError } from "./errors.js";

export default function validateContribution(request, _response, next) {
  const group = request.group;
  if (!group) {
    return next(createHttpError(404, "Group not found."));
  }

  const member = findById(request.app.locals.data.members, request.body?.memberId);
  if (!member || String(member.groupId) !== String(group.id)) {
    return next(createHttpError(404, "Member not found in this group."));
  }

  const amount = Number(request.body?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return next(
      createHttpError(400, "Contribution amount must be greater than 0."),
    );
  }

  request.member = member;
  request.validatedContribution = { amount };
  next();
}
