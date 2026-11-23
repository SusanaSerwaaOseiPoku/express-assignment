import { randomUUID } from "node:crypto";
import { findById } from "../data/store.js";

export function listGroups(request, response) {
  response.json(request.app.locals.data.groups);
}

export function getGroup(request, response) {
  response.json(request.group);
}

export function createGroup(request, response) {
  const data = request.app.locals.data;
  const body = request.validatedGroup;
  const group = {
    id: body.id === undefined ? randomUUID() : String(body.id),
    name: body.name,
    contributionAmount: body.contributionAmount,
    frequency: body.frequency,
    startDate: body.startDate,
    currentRound: Number(body.currentRound) > 0 ? Number(body.currentRound) : 1,
  };
  if (findById(data.groups, group.id)) {
    group.id = randomUUID();
  }
  data.groups.push(group);
  response.status(201).json(group);
}

export function deleteGroup(request, response) {
  const data = request.app.locals.data;
  const groupId = request.group.id;
  data.groups.splice(data.groups.indexOf(request.group), 1);
  data.members = data.members.filter(
    (member) => String(member.groupId) !== String(groupId),
  );
  data.contributions = data.contributions.filter(
    (contribution) => String(contribution.groupId) !== String(groupId),
  );
  response.status(204).end();
}
