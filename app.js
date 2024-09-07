const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 8000;

// URL of YouTube Trending Music page
const url = 'https://m.youtube.com/feed/trending?bp=4gINGgt5dG1hX2NoYXJ0cw%3D%3D';

async function fetchTrendingMusicData() {
    try {
        // Launch Puppeteer and open a new browser page
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Navigate to the YouTube trending music page
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Extract video metadata
        const videos = await page.evaluate(() => {
            const videoElements = document.querySelectorAll('div.media-item');
            const videoData = [];

            videoElements.forEach(element => {
                const titleElement = element.querySelector('h3.title');
                const thumbnailElement = element.querySelector('img');
                const descriptionElement = element.querySelector('div.description');
                const viewsElement = element.querySelector('span.view-count');
                const likesElement = element.querySelector('button.like-button-renderer-like-button');

                const video = {
                    title: titleElement ? titleElement.textContent.trim() : null,
                    thumbnail: thumbnailElement ? thumbnailElement.src : null,
                    description: descriptionElement ? descriptionElement.textContent.trim() : null,
                    views: viewsElement ? viewsElement.textContent.trim().replace(' views', '') : null,
                    likes: likesElement ? likesElement.textContent.trim().replace(' likes', '') : null
                };

                videoData.push(video);
            });

            return videoData;
        });

        // Close the Puppeteer browser
        await browser.close();

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
