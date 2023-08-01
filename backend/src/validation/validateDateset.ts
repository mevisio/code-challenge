
import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from "express-validator";
import isUrlHttp from 'is-url-http';

/***
 * Custom validation function to check if the input is an RSS feed URL or plain text
 */
const isValidDataSet = (value: string): boolean => {
  if (isUrlHttp(value)) {
    // Check if it's a valid RSS feed URL
    if (value.endsWith(".xml") || value.endsWith(".rss")) {
      return true;
    }
    return false;
  } else {
    // Check it is plain text
    return true;
  }
};

// Validation chain to check if the input is a valid RSS feed URL, or plain text
export const validateDataset = [
  check("dataset")
    .isString().withMessage( "dataset must be a string.")
    .optional()
    .withMessage("Invalid URL")
    .custom(isValidDataSet)
    .withMessage("Invalid dataset. Should be a valid RSS feed URL(ending with .xml or .rss), or plain text."),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
