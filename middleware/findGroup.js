import { findById } from "../data/store.js";
import { createHttpError } from "./errors.js";

function lookupGroup(request, next, required) {
  let id;
  if (request.params.id !== undefined) {
    id = request.params.id;
  } else if (request.body?.groupId !== undefined) {
    id = request.body.groupId;
  } else if (request.query.groupId !== undefined) {
    id = request.query.groupId;
  }

  if (id === undefined) {
    if (required) {
      return next(createHttpError(404, "Group not found."));
    }
    return next();
  }

  const group = findById(request.app.locals.data.groups, id);
  if (!group) {
    return next(createHttpError(404, "Group not found."));
  }

  request.group = group;
  next();
}

export default function findGroup(request, _response, next) {
  lookupGroup(request, next, false);
}

export function requireGroup(request, _response, next) {
  lookupGroup(request, next, true);
}
