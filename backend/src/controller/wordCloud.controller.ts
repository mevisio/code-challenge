
import { Request, Response } from 'express';
import axios from "axios";
import { removeStopwords } from 'stopword'
import  { parseString } from "xml2js"
import { wordCloudResponse, RssChannelItem } from '../types.js';

/***
 * The function display the words that occur in the dataset,
 * with the size(frequency) of each word representing the number of occurrences.
 */
export const wordCloud = async (req: Request, res: Response) => {
    const { dataset } = req.body;
  
    try {
      const words = await getWordsFromDataset(dataset);
  
      // Remove stop words like ["and" and "or", etc...]
      const filteredWords = removeStopwords(words);
      
      // Count the frequency of each word
      const wordFrequency: { [word: string]: number } = {};

      for (const word of filteredWords) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      };
      
      // Sort words based on frequency in descending order
      const sortedWords = Object.keys(wordFrequency).sort((a, b) => wordFrequency[b] - wordFrequency[a]);
  
      // Create an array of objects of { text, value } with word and its frequency count
      const wordFrequencyArray = sortedWords.map(word => ({ 
        text: word, 
        value: wordFrequency[word] 
      }));
      
      const response: wordCloudResponse  = {
        status: true,
        message: 'word cloud generated successfully',
        wordCloudData: wordFrequencyArray,
      };
  
      return res.status(200).json(response);

    } catch (error: any) {
      const response: wordCloudResponse = {
        status: false,
        message: error?.message,
      };
  
      return res.status(500).json(response);
    }
  }

  /***
   * Takes a dataset as input, which can be either an RSS URL or a plain text
   * Example: dataset = "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" 
   * and processes the dataset and returns an array of words extracted from it.
   */
  export const getWordsFromDataset = async (dataset: string): Promise<string[]>  => {
    // dataset :- is a plain text
    let text: string = dataset;

    try {

      // Check the dataset type is RSS URL format
      if (dataset.endsWith(".xml") || dataset.endsWith(".rss")) {
        text = await extractTextFromRSSUrl(dataset);
      } 

      return processText(text);
    } catch (error) {
      throw new Error("Error fetching or parsing dataset.");
    }
  }
  

  /***
   * Takes a text as input and processes the logic to handle special case 
   * and split words in to array of each words.
   * Example: ['this', 'is', 'a', 'simple', 'plain', 'text', 'sample']
   */
  const processText = (text: string): string[] => {
    
    if (!text.length) {
      return [];
    }

    const cleanedText = text.replace(/[.,!?/|]/g, '').toLowerCase();
    const words = cleanedText.split(' ');
    return words;
  }
  

  /***
   * Takes a dataFromRSSUrl as input and extract the XML format as an XML string,
   * process and return as text.
   */
  const extractTextFromRSSUrl = async (dataFromRSSUrl: string): Promise<string> => {
    try {
  
      // Using axios, extract the XML format
      const response = await axios.get(dataFromRSSUrl);
      const xmlString = response.data;
      
      let text = "";
  
      // Parse the XML string
      text = extractTextFromRSSFeed(xmlString, text);
      
      return text.trim();
    } catch (error) {
      throw new Error("Error fetching or parsing RSS feed.");
    }
  }
  
  
  /***
   * Extract the relevant text from the RSS feed (title and description)
   * Assuming that the text we need to extract is contained within the 
   * 'title' and 'description' fields.
   */
  const extractTextFromRSSFeed = (xmlString: any, text: string): string => {
    parseString(xmlString, (err, result) => {
      if (err) {
        throw new Error("Error parsing RSS feed XML.");
      }
  
      const items = result?.rss?.channel[0]?.item || [];
  
      items.forEach((item: RssChannelItem) => {
        text += `${item.title} ${item.description}`;
      });
    });
  
    return text;
  }