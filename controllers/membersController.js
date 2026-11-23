import { randomUUID } from "node:crypto";
import { findById } from "../data/store.js";
import { createHttpError } from "../middleware/errors.js";

export function listMembers(request, response) {
  const { members } = request.app.locals.data;
  response.json(
    request.group
      ? members.filter(
          (member) => String(member.groupId) === String(request.group.id),
        )
      : members,
  );
}

export function createMember(request, response) {
  const data = request.app.locals.data;
  const body = request.validatedMember;
  const member = {
    id: body.id === undefined ? randomUUID() : String(body.id),
    groupId: request.group.id,
    name: body.name,
    paid: body.paid === true || body.status === "paid",
  };
  if (findById(data.members, member.id)) {
    member.id = randomUUID();
  }
  data.members.push(member);
  response.status(201).json(member);
}

export function updateMember(request, response, next) {
  const member = findById(request.app.locals.data.members, request.params.id);
  if (!member) {
    return next(createHttpError(404, "Member not found."));
  }

  const body =
    request.body !== null && typeof request.body === "object" && !Array.isArray(request.body)
      ? request.body
      : {};
  if (typeof body.paid === "boolean") {
    member.paid = body.paid;
  } else if (body.status === "paid" || body.status === "pending") {
    member.paid = body.status === "paid";
  } else {
    return next(createHttpError(400, "Status must be paid or pending."));
  }
  response.json(member);
}

export function deleteMember(request, response, next) {
  const data = request.app.locals.data;
  const member = findById(data.members, request.params.id);
  if (!member) {
    return next(createHttpError(404, "Member not found."));
  }
  data.members.splice(data.members.indexOf(member), 1);
  response.status(204).end();
}
