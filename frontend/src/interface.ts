export interface IWordCloudOptions {
    rotations: number;
    rotationAngles: [number, number];
    fontSizes: [number, number];
  }
  
export type Word = {
    text: string;
    value: number;
  };
  
export type wordCloudResponse = {
    wordCloudData?: Word[]
  }