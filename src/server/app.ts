import express from "express";
import next from "next";

import routes from "../routes";

import "../auth";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const PORT = process.env.PORT || 3000;
const handle = app.getRequestHandler();

(async () => {
  try {
    await app.prepare();
  } catch (e) {
    throw e;
  }

  const server = express();

  server.post("/login", routes.site.login);
  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(PORT, () => {
    console.log(`Server Running at :${PORT}`);
  });
})();
