require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const validUrl = require('valid-url');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Add body parsing middleware
app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let urlDatabase = {};
let shortUrlId = 1;

app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  // Validate the URL using the 'valid-url' module
  if (!validUrl.isUri(url)) {
    return res.json({ error: 'invalid url' });
  }

  // Verify the URL using dns.lookup
  const parsedUrl = new URL(url);
  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Generate a unique short URL
    const shortUrl = shortUrlId++;

    // Store the original URL and the short URL in the urlDatabase object
    urlDatabase[shortUrl] = url;

    // Return the JSON response
    res.json({ original_url: url, short_url: shortUrl });
  });
});

app.get('/api/shorturl/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;

  if (!urlDatabase.hasOwnProperty(shortUrl)) {
    return res.json({ error: 'No short URL found for the given input' });
  }

  const originalUrl = urlDatabase[shortUrl];
  res.redirect(originalUrl);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
