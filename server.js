import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { createStarterData } from "./data/store.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import logger from "./middleware/logger.js";
import contributionsRouter from "./routes/contributions.js";
import groupsRouter from "./routes/groups.js";
import membersRouter from "./routes/members.js";

const PORT = Number(process.env.PORT) || 3001;

export function createApp(data = createStarterData()) {
  const app = express();
  app.locals.data = data;

  app.use(logger);
  app.use(cors());
  app.use(express.json());

  app.use("/groups", groupsRouter);
  app.use("/members", membersRouter);
  app.use("/contributions", contributionsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

const app = createApp();

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  app.listen(PORT, () => {
    console.log(`Susu Circle API listening at http://localhost:${PORT}`);
  });
}
