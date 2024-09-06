const express = require('express');
const fetch = require('node-fetch');
const ytMetadata = require('yt_metadata');

const app = express();
const PORT = process.env.PORT || 8000;  // Default to port 8000 if not specified

// Endpoint to search YouTube and get metadata
app.get('/search', async (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(searchUrl);
        const html = await response.text();
        const videoIds = [];
        const regex = /"videoId":"(.*?)"/g;
        let match;

        while ((match = regex.exec(html)) !== null) {
            videoIds.push(match[1]);
        }

        if (videoIds.length > 0) {
            const videoId = videoIds[0];
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            const metadata = await ytMetadata(videoUrl);

            const videoData = {
                videoId: videoId,
                title: metadata.title || 'N/A',
                keywords: metadata.keywords || [],
                description: metadata.description || 'N/A',
                thumbnailUrl: metadata.thumbnail_url || 'N/A',
            };

            res.json(videoData);
        } else {
            res.status(404).json({ error: 'No videos found' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
