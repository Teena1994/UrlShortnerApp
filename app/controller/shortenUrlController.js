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
    res.status(500).json({ success: false, 
                           error_code: error.code ? error.code: 'UNKNOWN', 
                           error_msg: error.cause? error.cause: error.message });

  }
};

const createShortUrl = async (url, res) => {
  
  //API to shorten the URL
  const response = await axios.get(apiBaseUrl, { params: { 'url': url } });

  response.then(async (response) => {

    const shortUrl = response.data.result.short_link;

    const newShortenUrlList = new shortenUrlListModel({ 'originalUrl': url, shortenUrl: shortUrl });

    await newShortenUrlList.save();

    return { success: true, 'originalUrl': url, shortenUrl: shortUrl };

  }).catch(async (err) => {
    let errResponse = (err.response) ? err.response : err.cause;
    console.error('Error while calling API to create short URL.');
    var errorObj = await handleError(errResponse);
    if (errorObj.success === false) {
      res.status(400).json({ success: false, error_message: errorObj.error_msg, error_code: errorObj.error_code });
    } else {
      res.status(400).json({ success: false,error_code: err.code ? err.code: 'UNKNOWN', error_msg: err.message });
    }
  });
}

const handleError = async (errorResponse) => {
  if (errorResponse & errorResponse.data && errorResponse.data.error_code === 1) {
    return { success: false, error_code: errorResponse.data.error_code, error_msg: 'Error: Enter long URL to get the short URL!' };
  }
  if (errorResponse & errorResponse.data && errorResponse.data.error_code === 10) {
    return { success: false, error_code: errorResponse.data.error_code, error_msg: `Error: The link you entered is a disallowed link, ${errorResponse.data.disallowed_reason}` };
  }
  if (errorResponse) {
    return { success: false, error_code: errorResponse.code, error_msg: JSON.stringify(errorResponse) };
  }

}

module.exports = getShortenUrl;