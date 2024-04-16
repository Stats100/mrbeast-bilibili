const express = require('express');
const cors = require('cors');

const app = express();
const port = 9003;
app.use(cors('*'))

app.get('*', async (req, res) => {
    await fetch('https://api.bilibili.com/x/relation/stat?vmid=1027737427')
    .then(res => {
        console.dir(res, { depth: null })
        return res.json()
    })
    .then(data => {
        res.json({ data });
    })
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
