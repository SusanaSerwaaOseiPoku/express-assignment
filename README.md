# Susu Circle API

A small Express API for the Susu Circle React app. It keeps groups, members,
and contributions in memory; changes are reset when the server restarts. The
React app can continue using the same API origin and endpoints.

## Run locally

Requirements: Node.js 20 or newer and npm.

```sh
npm install
npm run dev
```

The API listens at `http://localhost:3001`. Set `PORT` to use another port.

## Folder tree

```text
.
├── controllers/
│   ├── contributionsController.js
│   ├── groupsController.js
│   └── membersController.js
├── data/
│   └── store.js
├── middleware/
│   ├── errors.js
│   ├── findGroup.js
│   ├── logger.js
│   ├── validateContribution.js
│   ├── validateGroup.js
│   └── validateMember.js
├── routes/
│   ├── contributions.js
│   ├── groups.js
│   └── members.js
├── test/
│   └── api.test.js
└── server.js
```

## Endpoints

| Method | Path | Success | Errors |
| --- | --- | --- | --- |
| `GET` | `/groups` | `200` group array | - |
| `GET` | `/groups/:id` | `200` group object | `404` unknown group |
| `POST` | `/groups` | `201` created group | `400` missing name or amount not greater than zero |
| `DELETE` | `/groups/:id` | `204`; also removes related members and contributions | `404` unknown group |
| `GET` | `/members` | `200` member array; optional `?groupId=...` filter | `404` unknown group filter |
| `POST` | `/members` | `201` created member | `400` missing name; `404` unknown group |
| `PATCH` | `/members/:id` | `200` updated member; send `{ "paid": true }` or `{ "status": "paid" }` / `{ "status": "pending" }` | `400` invalid status; `404` unknown member |
| `DELETE` | `/members/:id` | `204`; contribution history is retained | `404` unknown member |
| `GET` | `/contributions` | `200` contribution array; optional `?groupId=...` filter | `404` unknown group filter |
| `POST` | `/contributions` | `201` created contribution; member is marked paid | `400` amount not greater than zero; `404` unknown group or member |

Group creation accepts `name` and `contributionAmount`, with optional
`frequency` and `startDate`. Member creation accepts `name` and `groupId`, with
optional `paid`. Contribution creation accepts `groupId`, `memberId`, and
`amount`, with optional `date` and `round`. Successful list endpoints return
JSON arrays; errors return a JSON object with a `message`.

## Middleware

- **logger** records each request's method, path, status, and elapsed time.
- **validateGroup** trims and checks a group's required name and positive,
  finite contribution amount before creation.
- **findGroup** looks up a group from the route parameter, request body, or
  query string; a missing group returns `404`.
- **validateContribution** checks that the target member belongs to the group
  and that the contribution amount is positive and finite.
- **validateMember** checks and trims the required member name before group
  lookup and creation.
- **notFound** creates the common `404` response for unmatched endpoints.
- **errorHandler** formats middleware and route errors in one place as JSON.

`server.js` configures Express, mounts the three routers, and places `notFound`
and `errorHandler` last.

## Test

```sh
npm test
```
