import { useEffect, useState, useRef } from "react";
import "./App.css";
import ReactWordcloud, { Word } from 'react-wordcloud';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { IWordCloudOptions, wordCloudResponse } from "./interface";

export function App() {
  const [words, setWords] = useState<Word[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [showWordCloud, setShowWordCloud] = useState<boolean>(false);
  const [downloadLink, setDownloadLink] = useState<string>('');

  const wordCloudRef = useRef<HTMLDivElement | null>(null);

  // fetch wordCloud Data
  const fetchWordCloud = async (inputValue: string) => {
    try {
      const response = await axios.post<wordCloudResponse>("http://localhost:8126/api/wordcloud", {
        dataset: inputValue,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
            
      return response.data.wordCloudData;
    } catch (error) {
      console.error("Error fetching word cloud data:", error);
      return [];
    }
  };
  

  useEffect(() => {
    const getWords = async () => {
      const wordCloudData = await fetchWordCloud(userInput);
      setWords(wordCloudData ?? []);
    };
    getWords();
  }, [userInput]);
  

  const options: IWordCloudOptions = {
    rotations: 2,
    rotationAngles: [-90, 0],
    fontSizes: [18, 50]
  };

  const handleGenerateWordCloud = (): void => {
    setShowWordCloud(true); // Display the word cloud when the submit button is clicked
  }

  const handleDownloadWordCloud = async (): Promise<void> => {
    if (wordCloudRef.current) {
      const canvas = await html2canvas(wordCloudRef.current);
      const dataUrl = canvas.toDataURL('image/png').replace(/^data:image\/[^;]/, 'data:application/octet-stream');
      setDownloadLink(dataUrl);
    }
  };

  return (
    <div className="wordcloud-container">
      <h2>Word Cloud</h2>
      <div>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type text or Enter a valid RSS Feed URL (ending with .xml or .rss)"
          maxLength={200000}
        ></textarea>
      </div>
      {showWordCloud && (
        <div ref={wordCloudRef} className="wordcloud-wrapper">
          <ReactWordcloud words={words} options={options} />
        </div>
      )}
      <button onClick={handleGenerateWordCloud}>Generate Word Cloud</button>
      <button onClick={handleDownloadWordCloud}>Download Word Cloud</button>
      {downloadLink && (
        <a href={downloadLink} download="wordcloud.png" ref={(ref) => ref?.click()}></a>
      )}
    </div>
  );
}
