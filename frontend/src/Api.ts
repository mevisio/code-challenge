export type EndpointResponse =
  | SuccessfulEndpointResponse
  | UnsuccessfulEndpointResponse;

export interface UnsuccessfulEndpointResponse {
  readonly ok: false;

  /**
   * A description of what went wrong.
   */
  readonly error: string;
}

export interface SuccessfulEndpointResponse {
  readonly ok: true;

  /**
   * This field should be sorted by the
   * number of occurrences, in descending
   * order.
   */
  readonly words: WordOccurrences[];
}

export interface WordOccurrences {
  readonly word: string;
  readonly occurrences: number;
}

export type Dataset = FileDataset | RssDataset;

export interface FileDataset {
  readonly type: "File";
  readonly file: File;
}

export interface RssDataset {
  readonly type: "RSS";
  readonly url: URL;
}

export async function submitDataset(
  dataset: Dataset,
  { signal }: { signal?: AbortSignal } = {},
): Promise<WordOccurrences[]> {
  switch (dataset.type) {
    case "File":
      return submitFileDataset(dataset, { signal });

    case "RSS":
      return submitRssDataset(dataset, { signal });
  }
}

async function submitFileDataset(
  dataset: FileDataset,
  { signal }: { signal?: AbortSignal },
): Promise<WordOccurrences[]> {
  const response = await fetch("/api/word-occurrences/file", {
    signal,
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: await dataset.file.arrayBuffer(),
  });

  return parseResponse(response);
}

async function submitRssDataset(
  dataset: RssDataset,
  { signal }: { signal?: AbortSignal },
) {
  const url = new URL("/api/word-occurrences/rss", location.href);
  url.searchParams.set("url", dataset.url.href);

  const response = await fetch(url, {
    signal,
  });

  return parseResponse(response);
}

async function parseResponse(response: Response): Promise<WordOccurrences[]> {
  const json: EndpointResponse = await response.json();

  if (!json.ok) {
    throw new Error(json.error);
  }

  return json.words;
}
