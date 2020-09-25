import express from "express";
import next from "next";

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

  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(PORT, () => {
    console.log(`Server Running at :${PORT}`);
  });
})();
