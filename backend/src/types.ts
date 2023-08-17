
type WordCloudData = {
    text: string;
    value: number;
  }

export type wordCloudResponse = {
    status: boolean,
    message: string,
    wordCloudData?: WordCloudData[]
  }

export type RssChannelItem = {
    title: string;
    description: string
  }
