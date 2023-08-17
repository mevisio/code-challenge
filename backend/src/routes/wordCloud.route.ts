
import express from "express";
import { validateDataset } from "../validation/validateDateset.js";
import { wordCloud } from "../controller/wordCloud.controller.js";

const router = express.Router();

// Your routes and middleware go here
router.post('/wordcloud', validateDataset, wordCloud)

export default router;
