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
      let shortUrlDetails = await createShortUrl(url, res);
        if(shortUrlDetails.success){
          res.status(200).json({ success: true, shortUrl: shortUrlDetails.shortenUrl, orginalUrl: shortUrlDetails.originalUrl, updatedDate: 'just now' });
        } else {
          res.status(400).json({ success: false, error_message: shortUrlDetails.error_msg, error_code: shortUrlDetails.error_code });
        }
    }   
  } catch (error) {
    console.error('Error shortening URL:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });

  }
};

const createShortUrl = async (url, res)=>{
  try {
    //API to shorten the URL
    const response = await axios.get(apiBaseUrl, { params: { 'url': url } });

    // Check if the response contains a short URL
    if (response.data.ok && response.data.result) {

      const shortUrl = response.data.result.short_link;

      const newShortenUrlList = new shortenUrlListModel({ 'originalUrl': url, shortenUrl: shortUrl });

      await newShortenUrlList.save();

      return {success: true, 'originalUrl': url, shortenUrl: shortUrl};
      
    } 
  }catch (err) {
    console.error('Error while calling API to create short URL:', err.response.data);
    var errorObj = await handleError(err.response);
    if(errorObj.success === false){
      res.status(400).json({ success: false, error_message: errorObj.error_msg, error_code: errorObj.error_code });
      process.exit(0);
    } else {
      res.status(500).json({ success: false, message: 'Server error' });
      process.exit(0);
    }
  }

}

const handleError = async (errorResponse)=>{
    if(errorResponse.data.error_code === 1){
      return {success: false, error_code: errorResponse.data.error_code, error_msg: 'Error: Enter long URL to get the short URL!'};
    }
    if(errorResponse.data.error_code === 10){
      return {success: false, error_code: errorResponse.data.error_code, error_msg: `Error: The link you entered is a disallowed link, ${errorResponse.data.disallowed_reason}`};
    }
}

module.exports = getShortenUrl;


