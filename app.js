const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 8000;

// URL of YouTube Trending Music page
const url = 'https://m.youtube.com/feed/trending?bp=4gINGgt5dG1hX2NoYXJ0cw%3D%3D';

async function fetchTrendingMusicData() {
    try {
        // Fetch the HTML content of the trending music page
        const { data } = await axios.get(url);

        // Load the HTML content into cheerio
        const $ = cheerio.load(data);

        // Initialize an array to store the video metadata
        const videos = [];

        // Select and extract relevant data for each video
        $('div.media-item').each((i, element) => {
            const video = {};

            // Extract video title
            video.title = $(element).find('h3.title').text().trim();

            // Extract video thumbnail URL
            video.thumbnail = $(element).find('img').attr('src');

            // Extract video description (if available)
            video.description = $(element).find('div.description').text().trim();

            // Extract views count
            const viewsText = $(element).find('span.view-count').text().trim();
            video.views = viewsText ? viewsText.replace(' views', '') : null;

            // Extract like count (if available)
            const likeText = $(element).find('button.like-button-renderer-like-button').text().trim();
            video.likes = likeText ? likeText.replace(' likes', '') : null;

            // Add the video object to the videos array
            videos.push(video);
        });

        return videos;

    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

app.get('/trending-music', async (req, res) => {
    const videos = await fetchTrendingMusicData();
    res.json(videos);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
