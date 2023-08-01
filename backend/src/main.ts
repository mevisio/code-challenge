import express, { Request, Response } from 'express';
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { join, dirname } from 'path';
import wordCloudRouter from './routes/wordCloud.route.js';

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // Replace with your frontend's domain or use '*' for any domain (only for development)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', wordCloudRouter);

// Define the route handling for "GET /api/challenge"
app.get('/api/challenge', async (req: Request, res: Response) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers["host"]}`);

    if (`${req.method} ${url.pathname}`) {
      // Read and render the markdown file as HTML
      const challengeMarkdownPath = join(dirname(fileURLToPath(import.meta.url)), '../../CHALLENGE.md');
      const challengeMarkdown = await readFile(challengeMarkdownPath, 'utf8');
      const html = await marked(challengeMarkdown, { async: true });
  
      res.writeHead(200);
      res.write(html);
      res.end();
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.write("Something went wrong! Check the console...");
    res.end();
  }
});

// Define the route handling for non-existing path (404 handling)
app.use((req: Request, res: Response) => {
  res.writeHead(404);
  res.write("Not Found");
  res.end();
});

app.listen(8126, () => {
  console.log("Listening on http://localhost:8126");
});
