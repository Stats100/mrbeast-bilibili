import express from 'express';
import cors from 'cors';

const app = express();
const port = 16902;
app.use(cors('*'));

const url = 'https://api.bilibili.com/x/relation/stat?vmid=1027737427';

// Get the API response
app.get('*', async (_req, res) => {
    await fetch(url)
        .then(response => {
            return response.json();
        })
        .then(data => {
            res.json({ data });
        });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
