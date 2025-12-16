const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const path = require("path");

const dev = true;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, "../certs/key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "../certs/cert.pem")),
  };

  console.log("Starting https server on port 4000...");

  createServer(httpsOptions, (req, res) => {
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self';");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    handle(req, res, parse(req.url, true));
  }).listen(4000, () => {
    console.log(`Next.js (https) is running at https://localhost:4000`);
  });
});