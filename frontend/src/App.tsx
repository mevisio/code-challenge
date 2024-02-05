import { ReactElement, useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  Dataset,
  FileDataset,
  RssDataset,
  WordOccurrences,
  submitDataset,
} from "./Api";

export function App() {
  const [dataset, setDataset] = useState<Dataset>();

  const [occurrences, setResult] = useState<WordOccurrences[]>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);

  useEffect(() => {
    if (dataset == null) {
      return;
    }

    const controller = new AbortController();

    setError(undefined);
    setIsLoading(true);

    submitDataset(dataset, { signal: controller.signal })
      .then(setResult)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [dataset]);

  return (
    <div className="App">
      <h1>WordCloud Generator</h1>

      <button onClick={() => setShowChallenge((v) => !v)}>
        {showChallenge ? "Hide" : "Show"} Challenge
      </button>

      {error && <pre>{error.message}</pre>}

      {showChallenge ? (
        <Challenge />
      ) : (
        <DatasetInput value={dataset} onChange={setDataset} />
      )}

      {isLoading && "Loading..."}

      {occurrences && occurrences.length > 0 && (
        <Cloud occurrences={occurrences} />
      )}
    </div>
  );
}

function Cloud({ occurrences }: { occurrences: WordOccurrences[] }) {
  const maxOccurrence = useMemo(
    () =>
      occurrences.map((o) => o.occurrences).reduce((a, b) => Math.max(a, b)),
    [occurrences],
  );
  const minOccurrence = useMemo(
    () =>
      occurrences.map((o) => o.occurrences).reduce((a, b) => Math.min(a, b)),
    [occurrences],
  );

  const normalize = (o: number) =>
    (o - minOccurrence) / (maxOccurrence - minOccurrence);

  return (
    <div className="Cloud">
      {occurrences.map(({ word, occurrences }) => (
        <span style={{ fontSize: 10 + 30 * normalize(occurrences) }}>
          {word}
        </span>
      ))}
    </div>
  );
}

function DatasetInput({
  value,
  onChange,
}: {
  value: Dataset | undefined;
  onChange: (value: Dataset) => void;
}) {
  const [type, setType] = useState(value?.type ?? "File");

  return (
    <>
      <h2>Dataset</h2>
      <Tabs
        value={type}
        onChange={setType}
        tabs={{
          File: <FileDatasetInput onChange={onChange} />,
          RSS: (
            <RssDatasetInput
              value={value?.type === "RSS" ? value : undefined}
              onChange={onChange}
            />
          ),
        }}
      />
    </>
  );
}

function Tabs<T extends Record<string, ReactElement>>({
  value,
  onChange,
  tabs,
}: {
  value: keyof T;
  onChange: (value: keyof T) => void;
  tabs: T;
}) {
  return (
    <div className="Tabs">
      <ol>
        {Object.keys(tabs).map((k) => (
          <li key={k}>
            <input
              id={k}
              className="Tabs__radio"
              type="radio"
              checked={value === k}
              onChange={() => onChange(k)}
            />
            <label htmlFor={k}>{k}</label>
          </li>
        ))}
      </ol>
      <div>{tabs[value]}</div>
    </div>
  );
}

function FileDatasetInput({
  onChange,
}: {
  onChange: (value: FileDataset) => void;
}) {
  return (
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file != null) {
          onChange({ type: "File", file });
        }
      }}
    />
  );
}

function RssDatasetInput({
  value,
  onChange,
}: {
  value: RssDataset | undefined;
  onChange: (value: RssDataset) => void;
}) {
  const [url, setUrl] = useState(value?.url.href ?? "");

  useEffect(() => {
    const input = value?.url.href ?? "";
    if (input !== url) {
      setUrl(input);
    }
  }, [value]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onChange({
          type: "RSS",
          url: new URL(url),
        });
      }}
    >
      <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} />

      <button type="submit">Submit</button>
    </form>
  );
}

function Challenge() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [html, setHtml] = useState("");

  useEffect(() => {
    fetch("/api/challenge")
      .then((r) => r.text())
      .then(setHtml)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  if (error != null) {
    console.error(error);
    return <div>Error! Check console...</div>;
  }

  return (
    <div className="App">
      {isLoading ? "Loading..." : null}
      <article dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
