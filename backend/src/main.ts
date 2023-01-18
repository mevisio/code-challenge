import { createServer } from "node:http";
import { IncomingMessage, ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

createServer(router).listen(8126, () => {
  console.log("Listening on http://localhost:8126");
});

async function router(req: IncomingMessage, res: ServerResponse) {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers["host"]}`);

    switch (`${req.method} ${url.pathname}`) {
      case "GET /api/challenge":
        res.writeHead(200);
        res.write(
          await marked(
            await readFile(
              fileURLToPath(new URL("../../CHALLENGE.md", import.meta.url)),
              "utf8"
            ),
            { async: true }
          )
        );
        break;

      default:
        res.writeHead(404);
        res.write("Not Found");
        break;
    }
  } catch (e) {
    console.error(e);
    res.writeHead(500);
    res.write("Something went wrong! Check the console...");
  } finally {
    res.end();
  }
}
