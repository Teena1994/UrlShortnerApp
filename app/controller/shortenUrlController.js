const axios = require('axios');
const shortenUrlListModel = require('../model/shortenUrlListModel');
const NodeCache = require('node-cache');
const myCache = new NodeCache();
const apiBaseUrl = process.env.API_BASE_URL;

/* Fetch all the list of urls from cache.
   If cache is expired or empty fetch from db and store in cache
   First check in cache if the shortUrl for that particular orginalUrl exists or not
   If not exists in cache create the shortUrl and add new url to the cache */

const getShortenUrl = async (req, res) => {
  try {
    // Extract the URL to be shortened from the request parameters
    const { url } = req.query;

    // Store data in the cache with a TTL of 60 seconds
    myCache.set('myKey', 'myValue', 60);

    const urlListFromMongo = await shortenUrlListModel.findOne({originalUrl: url},{originalUrl:1, shortenUrl:1, date: 1});

    if(urlListFromMongo !== null){
      res.status(200).json({ success: true, shortUrl: urlListFromMongo.shortenUrl, orginalUrl: urlListFromMongo.originalUrl, updatedDate: urlListFromMongo.date});
    } else{
      let shortUrlDetails = await createShortUrl(url);
        if(shortUrlDetails.success){
          res.status(200).json({ success: true, shortUrl: shortUrlDetails.shortenUrl, orginalUrl: shortUrlDetails.originalUrl, updatedDate: 'just now' });
        } else {
          res.status(400).json({ success: false, message: 'Failed to shorten URL' });
        }
    }   
  } catch (error) {
    console.error('Error shortening URL:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createShortUrl = async (url)=>{
  try {
    //API to shorten the URL
    const response = await axios.get(apiBaseUrl, { params: { 'url': url } });
    console.log(response);

    // Check if the response contains a short URL
    if (response.data.ok && response.data.result) {

      const shortUrl = response.data.result.short_link;

      const newShortenUrlList = new shortenUrlListModel({ 'originalUrl': url, shortenUrl: shortUrl });

      await newShortenUrlList.save();

      return {success: true, 'originalUrl': url, shortenUrl: shortUrl};
      
    }
  }catch (err) {
    console.error('Error while calling API to create short URL:', err);
    throw err;
  }

}

module.exports = getShortenUrl;


