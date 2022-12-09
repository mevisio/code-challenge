import { createServer } from "node:http";
import { IncomingMessage, ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { DOMParser } from "@xmldom/xmldom";
import { marked } from "marked";

createServer(router).listen(8126, () => {
  console.log("Listening on http://localhost:8126");
});

async function router(req: IncomingMessage, res: ServerResponse) {
  try {
    const url = new URL(req.url, `http://${req.headers["host"]}`);

    switch (`${req.method} ${url.pathname}`) {
      case "GET /api/rss":
        if (!url.searchParams.has("feed")) {
          res.writeHead(400, {
            "Content-Type": "application/json",
          });
          res.write(
            JSON.stringify({
              error: "Missing required query parameter 'feed'",
            })
          );
          return;
        }

        const feedTexts = new InterlacedIterator(
          url.searchParams
            .getAll("feed")
            .map((f) => new URL(f))
            .map(fetchAndExtractTextFromFeed)
        );

        res.writeHead(200, {
          "Content-Type": "application/json",
        });
        res.write("[");
        let first = true;
        for await (const text of feedTexts) {
          if (first) {
            first = false;
          } else {
            res.write(",");
          }

          res.write(JSON.stringify(text));
        }
        res.write("]");
        break;

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

class InterlacedIterator<T> implements AsyncIterableIterator<T> {
  readonly #iterators: Set<AsyncIterator<T>>;
  readonly #buffer: T[] = [];

  constructor(iterators: Iterable<AsyncIterator<T>>) {
    this.#iterators = new Set(iterators);
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    return this;
  }

  async next(): Promise<IteratorResult<T, void>> {
    if (this.#buffer.length > 0) {
      return { done: false, value: this.#buffer.shift()! };
    }

    if (this.#iterators.size === 0) {
      return { done: true, value: undefined };
    }

    await Promise.race(
      Array.from(this.#iterators, async (iterator) => {
        const { done, value } = await iterator.next();
        if (done) {
          this.#iterators.delete(iterator);
        } else {
          this.#buffer.push(value);
        }
      })
    );

    return this.next();
  }
}

async function* fetchAndExtractTextFromFeed(
  url: URL
): AsyncIterableIterator<string> {
  const response = await fetch(url);
  const xml = new DOMParser().parseFromString(
    await response.text(),
    response.headers.get("Content-Type")
  );
  for (const descriptionElement of Array.prototype.slice.call(
    xml.getElementsByTagName("description")
  )) {
    yield descriptionElement.textContent.replace(/<.*?>/g, "").trim();
  }
}
