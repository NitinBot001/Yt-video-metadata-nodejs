const express = require('express');
const https = require('https');
const cheerio = require('cheerio'); // For HTML parsing

const app = express();
const port = 3000; // You can customize the port number

// Function to fetch and parse HTML content
async function fetchAndParseHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let htmlData = '';

      res.on('data', (chunk) => {
        htmlData += chunk;
      });

      res.on('end', () => {
        resolve(cheerio.load(htmlData));
      });

      res.on('error', (err) => {
        reject(err);
      });
    });
  });
}

// Function to extract video metadata
async function extractVideoMetadata(videoElement) {
  const title = videoElement.find('.title-text').text().trim();
  const thumbnailUrl = videoElement.find('img.style-scope.ytd-grid-video-renderer').attr('src'); // Prioritize image with 'style-scope.ytd-grid-video-renderer' class
  const description = videoElement.find('.description-snippet').text().trim() || ''; // Handle cases where description is missing
  const viewsCount = videoElement.find('.style-scope.ytd-grid-video-renderer .view-count').text().trim() || ''; // Account for potential view count format variations

  // Like count extraction currently not supported through scraping due to dynamic content.
  // Consider using YouTube Data API v3 for accurate like counts (requires API key and authorization).

  return { title, thumbnailUrl, description, viewsCount };
}

// Main function to fetch and process video metadata
async function fetchTrendingMusicMetadata(url) {
  try {
    const $ = await fetchAndParseHTML(url);
    const videoElements = $('.yt-simple-endpoint style-scope ytd-grid-video-renderer'); // Select video elements with specific class

    const videoMetadata = [];
    for (const videoElement of videoElements) {
      videoMetadata.push(await extractVideoMetadata($(videoElement)));
    }

    return videoMetadata;
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    return [];
  }
}

// Web server route to handle requests
app.get('/trending-music', async (req, res) => {
  const videoMetadata = await fetchTrendingMusicMetadata('https://m.youtube.com/feed/trending?bp=4gINGgt5dG1hX2NoYXJ0cw%3D%3D');
  res.json(videoMetadata);
});

// Start the web server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
