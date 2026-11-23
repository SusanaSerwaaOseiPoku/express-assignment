import { randomUUID } from "node:crypto";

export function listContributions(request, response) {
  const { contributions } = request.app.locals.data;
  response.json(
    request.group
      ? contributions.filter(
          (contribution) =>
            String(contribution.groupId) === String(request.group.id),
        )
      : contributions,
  );
}

export function createContribution(request, response) {
  const data = request.app.locals.data;
  const body = request.body;
  const contribution = {
    id: body.id === undefined ? randomUUID() : String(body.id),
    groupId: request.group.id,
    memberId: request.member.id,
    memberName: request.member.name,
    amount: request.validatedContribution.amount,
    date:
      typeof body.date === "string"
        ? body.date
        : new Date().toISOString().slice(0, 10),
    round:
      Number(body.round) > 0 ? Number(body.round) : request.group.currentRound,
  };
  if (
    data.contributions.some(
      (entry) => String(entry.id) === String(contribution.id),
    )
  ) {
    contribution.id = randomUUID();
  }
  data.contributions.push(contribution);
  request.member.paid = true;
  response.status(201).json(contribution);
}
