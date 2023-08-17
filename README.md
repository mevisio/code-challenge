# Mevisio Code Challenge
`Word cloud` App.

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#Prerequisites)
- [API Documentation](#postman-docs)
- [Improvements](#improvements)


# Introduction

This is a Full-stack application to make a `word cloud` based on the frequency of words in a dataset. The dataset should be either an RSS feed URL, or a Plain text.

## Prerequisites

* A fresh version of Node.js
* Yarn Classic

## Get Up and Running

1. Clone this repository.
2. Run `yarn`.
3. Run `yarn dev` to start the application.
4. Get started on your solution to [the challenge](./CHALLENGE.md)! Good Luck!


### Project Structure Backend

```bash
├── src
├── controller
├── routes
├── validation
├── main.ts
├── types.ts
├── package.json
└── tsconfig.json
```

A pictorial representation of how the frontend app looks can be found here and navigate to the URL below

```sh
http://localhost:5173/
```
![app-look](https://github.com/AbonyiXavier/social-network-Apis/assets/49367987/2ceb3d09-c93c-4a1c-a4f5-efa31a1b34d3)

### Features Implemented on the Backend

- Word Cloud Generation from Plain Text

```sh
POST request: http://localhost:8126/api/wordcloud
```

```sh
{
    "dataset": "This is a simple plain text sample for testing word cloud generation. It contains some common words like testing, word, cloud,  generation, and some repeated words, such as testing, word, and word."
}
```

- Word Cloud Generation from RSS Feed URL

```sh
POST request : http://localhost:8126/api/wordcloud
```

```sh
{
    "dataset": "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
}
```

### Features Implemented on the Frontend

- Integration of the Word Cloud Generator
- Download as PNG functionality


# _API Postman Documentation_

- Public API documentation of this project is available on [postman docs](https://documenter.getpostman.com/view/7775892/2s9XxvSaBu)

# Improvements

- Make provision to accommodate dataset input from Twitter hashtags to be generated as a word cloud.