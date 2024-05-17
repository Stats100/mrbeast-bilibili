const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { CronJob } = require('cron');

const app = express();
const port = 16902;
app.use(cors('*'));

const url = 'https://api.bilibili.com/x/relation/stat?vmid=1027737427';

// Create and connect to the history database
const db = new sqlite3.Database('data.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        db.run(`
            CREATE TABLE IF NOT EXISTS minutely (
                time INTEGER,
                value INTEGER
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS hourly (
                time INTEGER,
                value INTEGER
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS daily (
                time INTEGER,
                value INTEGER
            )
        `);
    }
});

// Write the count every minute, hour and day to the history database
function fetchDataAndWrite(table) {
    fetch(url)
        .then(response => response.json())
        .then(result => {
            const followerCount = result.data.follower;
            const timestamp = Math.floor(new Date() / 1000)
            db.run(`INSERT INTO ${table} (time, value) VALUES (?, ?)`, [timestamp, followerCount], (err) => {
                if (err) {
                    console.error(`Error inserting data into ${table}:`, err.message);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Schedule tasks
new CronJob('* * * * *', () => fetchDataAndWrite('minutely'), null, true, 'UTC'); // Every minute
new CronJob('0 * * * *', () => fetchDataAndWrite('hourly'), null, true, 'UTC'); // Every hour
new CronJob('0 0 * * *', () => fetchDataAndWrite('daily'), null, true, 'UTC'); // Every day

// Endpoints to return data from the database
app.get('/minutely', (_req, res) => {
    db.all('SELECT * FROM minutely', [], (err, data) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(data);
        }
    });
});

app.get('/hourly', (_req, res) => {
    db.all('SELECT * FROM hourly', [], (err, data) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(data);
        }
    });
});

app.get('/daily', (_req, res) => {
    db.all('SELECT * FROM daily', [], (err, data) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(data);
        }
    });
});

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
