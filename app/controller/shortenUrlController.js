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

    //Check whether url is present in mongoDb or not
    const urlListFromMongo = await shortenUrlListModel.findOne({ originalUrl: url }, { originalUrl: 1, shortenUrl: 1, date: 1 });
    if (urlListFromMongo !== null) {
      res.status(200).json({ success: true, shortUrl: urlListFromMongo.shortenUrl, orginalUrl: urlListFromMongo.originalUrl, updatedDate: urlListFromMongo.date });
    } else {
      let shortUrlDetails = await createShortUrl(url, res);
      if (shortUrlDetails.success) {
        res.status(200).json({ success: true, shortUrl: shortUrlDetails.shortenUrl, orginalUrl: shortUrlDetails.originalUrl, updatedDate: 'just now' });
      } else {
        res.status(400).json({ success: false, error_message: shortUrlDetails.error_msg, error_code: shortUrlDetails.error_code });
      }
    }
  } catch (error) {
    console.error('Error shortening URL: error in getShortenUrl()');
    res.status(400).json({ success: false, error_message: error.message });

  }
};

const createShortUrl = async (url, res) => {
  try {

    //API to shorten the URL
    const response = await axios.get(apiBaseUrl, { params: { 'url': url } });
    const shortUrl = response.data;

    //Store url details in MongoDB
    const newShortenUrlList = new shortenUrlListModel({ 'originalUrl': url, shortenUrl: shortUrl });
    await newShortenUrlList.save();

    return { success: true, 'originalUrl': url, shortenUrl: shortUrl };

  } catch (err) {
    console.log(err)
    //Handle errors
    let errResponse = (err.response) ? err.response : err;
    console.error('Error while calling API to create short URL.');

    var errorObj = await handleError(errResponse);
    if (errorObj.success === false) {
      res.status(400).json({ success: false, error_message: errorObj.error_msg });
    } else {
      res.status(400).json({ success: false, error_message: err.message });
    }
  }
}

//Error handling functions
const handleError = async (errorResponse) => {
  if (errorResponse & errorResponse.data) {
    return { success: false, error_msg: JSON.stringify(errorResponse.data) };
  }
  if (errorResponse) {
    return { success: false, error_msg: JSON.stringify(errorResponse) };
  }
}

module.exports = getShortenUrl;