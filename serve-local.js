const http = require("http");
const fs = require("fs");
const path = require("path");

const host = "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const root = path.resolve(__dirname);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
};

http
  .createServer((req, res) => {
    const rawPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const normalizedPath = rawPath === "/" ? "index.html" : rawPath.replace(/^\/+/, "");

    if (normalizedPath === "favicon.ico") {
      res.writeHead(204, { "Content-Type": "image/x-icon" });
      res.end();
      return;
    }

    const filePath = path.resolve(root, normalizedPath);
    const relativePath = path.relative(root, filePath);

    if (
      relativePath.startsWith("..") ||
      path.isAbsolute(relativePath)
    ) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      res.writeHead(200, {
        "Content-Type":
          mimeTypes[path.extname(filePath).toLowerCase()] ||
          "application/octet-stream",
      });
      res.end(data);
    });
  })
  .listen(port, host, () => {
    console.log(`Serving ${root} at http://${host}:${port}/`);
  });
