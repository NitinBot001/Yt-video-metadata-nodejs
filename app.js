const express = require('express');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

const app = express();

app.get('/get_metadata', async (req, res) => {
    // Get the song name from query parameters
    const songName = req.query.song_name;
    
    if (!songName) {
        return res.status(400).json({ error: "Song name is required" });
    }
    
    try {
        // Search for the song on YouTube using ytsr
        const searchResults = await ytsr(songName, { limit: 1 });
        
        if (searchResults.items.length === 0) {
            return res.status(404).json({ error: "No videos found for the song." });
        }

        // Get the first search result
        const video = searchResults.items[0];
        const videoId = video.id;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Fetch metadata using ytdl-core
        const info = await ytdl.getInfo(videoUrl);
        const metadata = {
            videoID: videoId,
            title: info.videoDetails.title,
            views: info.videoDetails.viewCount,
            length: info.videoDetails.lengthSeconds,  // length in seconds
            author: info.videoDetails.author.name,
            publish_date: info.videoDetails.publishDate,
            description: info.videoDetails.description,
            keywords: info.videoDetails.keywords,
            thumbnail_url: info.videoDetails.thumbnails[0].url,
        };

        return res.json(metadata);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An error occurred while fetching video metadata." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
