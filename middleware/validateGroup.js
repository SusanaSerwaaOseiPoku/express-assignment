import { createHttpError } from "./errors.js";

export default function validateGroup(request, _response, next) {
  const body =
    request.body !== null && typeof request.body === "object" && !Array.isArray(request.body)
      ? request.body
      : {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return next(createHttpError(400, "Group name is required."));
  }

  const contributionAmount = Number(body.contributionAmount);
  if (!Number.isFinite(contributionAmount) || contributionAmount <= 0) {
    return next(
      createHttpError(400, "Contribution amount must be greater than 0."),
    );
  }

  request.validatedGroup = { ...body, name, contributionAmount };
  next();
}
