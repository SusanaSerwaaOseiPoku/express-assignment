import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp } from "../server.js";

let server;
let baseUrl;

before(async () => {
  server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

async function request(path, { method = "GET", body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body === undefined ? {} : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = response.status === 204 ? undefined : await response.json();
  return { response, payload };
}

test("groups support list, lookup, create, validation, and delete", async () => {
  const initial = await request("/groups");
  assert.equal(initial.response.status, 200);
  assert.equal(initial.payload.length, 2);

  const lookup = await request("/groups/market-circle");
  assert.equal(lookup.response.status, 200);
  assert.equal(lookup.payload.name, "Market Women Circle");

  const missing = await request("/groups/missing");
  assert.equal(missing.response.status, 404);
  assert.deepEqual(missing.payload, { message: "Group not found." });
  assert.equal((await request("/not-an-endpoint")).response.status, 404);

  const invalidName = await request("/groups", {
    method: "POST",
    body: { name: " ", contributionAmount: 30 },
  });
  assert.equal(invalidName.response.status, 400);

  for (const contributionAmount of [0, -1, "invalid", "Infinity"]) {
    const invalidAmount = await request("/groups", {
      method: "POST",
      body: { name: "New Circle", contributionAmount },
    });
    assert.equal(invalidAmount.response.status, 400);
  }

  const created = await request("/groups", {
    method: "POST",
    body: {
      name: "New Circle",
      contributionAmount: 30,
      frequency: "weekly",
      startDate: "2026-11-20",
    },
  });
  assert.equal(created.response.status, 201);
  const deleted = await request(`/groups/${created.payload.id}`, {
    method: "DELETE",
  });
  assert.equal(deleted.response.status, 204);
  assert.equal(
    (await request(`/groups/${created.payload.id}`)).response.status,
    404,
  );
});

test("members support query filtering, create, status updates, and delete", async () => {
  const filtered = await request("/members?groupId=market-circle");
  assert.equal(filtered.response.status, 200);
  assert.deepEqual(
    filtered.payload.map((member) => member.id),
    ["ama", "esi"],
  );

  const invalid = await request("/members", {
    method: "POST",
    body: { name: " ", groupId: "market-circle" },
  });
  assert.equal(invalid.response.status, 400);

  const missingGroup = await request("/members", {
    method: "POST",
    body: { name: "Nana" },
  });
  assert.equal(missingGroup.response.status, 404);

  const created = await request("/members", {
    method: "POST",
    body: { name: "Nana", groupId: "market-circle" },
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.payload.paid, false);

  const paid = await request(`/members/${created.payload.id}`, {
    method: "PATCH",
    body: { status: "paid" },
  });
  assert.equal(paid.response.status, 200);
  assert.equal(paid.payload.paid, true);

  const pending = await request(`/members/${created.payload.id}`, {
    method: "PATCH",
    body: { paid: false },
  });
  assert.equal(pending.response.status, 200);
  assert.equal(pending.payload.paid, false);

  const deleted = await request(`/members/${created.payload.id}`, {
    method: "DELETE",
  });
  assert.equal(deleted.response.status, 204);
  assert.equal(
    (
      await request(`/members/${created.payload.id}`, {
        method: "PATCH",
        body: { paid: true },
      })
    ).response.status,
    404,
  );
});

test("contributions are filtered, validated, and created for group members", async () => {
  const filtered = await request("/contributions?groupId=market-circle");
  assert.equal(filtered.response.status, 200);
  assert.equal(filtered.payload.length, 1);

  const invalid = await request("/contributions", {
    method: "POST",
    body: { groupId: "market-circle", memberId: "ama", amount: 0 },
  });
  assert.equal(invalid.response.status, 400);

  const unknownMember = await request("/contributions", {
    method: "POST",
    body: { groupId: "market-circle", memberId: "missing", amount: 50 },
  });
  assert.equal(unknownMember.response.status, 404);
  assert.deepEqual(unknownMember.payload, {
    message: "Member not found in this group.",
  });

  const missingGroup = await request("/contributions", {
    method: "POST",
    body: { memberId: "ama", amount: 50 },
  });
  assert.equal(missingGroup.response.status, 404);

  const memberFromAnotherGroup = await request("/contributions", {
    method: "POST",
    body: { groupId: "market-circle", memberId: "kojo", amount: 50 },
  });
  assert.equal(memberFromAnotherGroup.response.status, 404);

  const created = await request("/contributions", {
    method: "POST",
    body: {
      groupId: "market-circle",
      memberId: "esi",
      amount: 50,
      date: "2026-11-20",
    },
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.payload.memberName, "Esi");
  assert.equal(created.payload.amount, 50);

  const unknownGroup = await request("/contributions?groupId=missing");
  assert.equal(unknownGroup.response.status, 404);
  assert.deepEqual(unknownGroup.payload, { message: "Group not found." });
});
