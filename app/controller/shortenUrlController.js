const axios = require('axios');
const shortenUrlListModel = require('../model/shortenUrlListModel');
const NodeCache = require('node-cache');
const myCache = new NodeCache();
const apiBaseUrl = process.env.API_BASE_URL;
var urlCacheDetails;

/* Fetch all the list of urls from cache.
   If cache is expired or empty fetch from db and store in cache
   First check in cache if the shortUrl for that particular orginalUrl exists or not
   If not exists in cache create the shortUrl and add new url to the cache */

const getShortenUrl = async (req, res) => {
  try {
    // Extract the URL to be shortened from the request parameters
    const { url } = req.query;

    //Check whether urldetails are there in cache or not
    urlCacheDetails = await getUrlCacheDetails(url);

    if (urlCacheDetails.success === false) {

      //Check whether url is present in mongoDb or not
      var urlListFromMongo = await shortenUrlListModel.findOne({ originalUrl: url }, { originalUrl: 1, shortenUrl: 1, date: 1 });

      if (urlListFromMongo !== null) {

        myCache.set("urlCacheData", [urlListFromMongo], 60);

        res.status(200).json({ success: true, shortUrl: urlListFromMongo.shortenUrl, orginalUrl: urlListFromMongo.originalUrl, updatedDate: urlListFromMongo.date });
      } else {
        //If url details not present in mongoDB then create and store details
        await createAndStoreShortURL(url, res);

      }
    } else {
      //send response from cache data
      let shortUrlDetails = urlCacheDetails.data;
      res.status(200).json({ success: true, shortUrl: shortUrlDetails.shortenUrl, orginalUrl: shortUrlDetails.originalUrl, updatedDate: shortUrlDetails.date });
    }
  } catch (error) {

    console.error('Error shortening URL: error in getShortenUrl()');
    res.status(400).json({ success: false, error_message: error.message });

  }
};

//Get url details from node cache 
const getUrlCacheDetails = async (url) => {
  try {
    if (myCache.has("urlCacheData")) {

      let urlCache = myCache.get("urlCacheData"),
        urlExistsInCache = (urlCache).find(urlData => urlData.originalUrl === url);

      if (urlExistsInCache) {
        console.log("Data exists in the cache!");
        return { success: true, data: urlExistsInCache };
      } else {
        return { success: false, 'data': [] }
      }

    } else {
      return { success: false, 'data': [] }
    }
  } catch (error) {
    console.error('Error in caching URL: error in getUrlCacheDetails()');
  }
}

const createAndStoreShortURL = async (url, res) => {
  //Set url details in cache and set cache expiration as 60sec
  myCache.set("urlCacheData", [], 60);
  console.log('Stored data in cache successfully!');

  //Call open source API to create a shortUrl for the longUrl and save the data in mongo DB and cache
  let shortUrlDetails = await createShortUrl(url, res);

  //return resposne if the process is successful otherwise return error
  if (shortUrlDetails.success) {
    res.status(200).json({ success: true, shortUrl: shortUrlDetails.shortenUrl, orginalUrl: shortUrlDetails.originalUrl, updatedDate: 'just now' });
  } else {
    res.status(400).json({ success: false, error_message: shortUrlDetails.error_msg, error_code: shortUrlDetails.error_code });
  }
}

const createShortUrl = async (url, res) => {

  try {

    //API to shorten the URL
    const response = await axios.get(apiBaseUrl, { params: { 'url': url } });
    const shortUrl = response.data;

    //Store url details in MongoDB
    const newShortenUrlList = new shortenUrlListModel({ 'originalUrl': url, shortenUrl: shortUrl });
    await newShortenUrlList.save();

    //Store the url details in cache
    (urlCacheDetails.data).push({ 'originalUrl': url, shortenUrl: shortUrl, date: new Date() });
    myCache.set('urlCacheData', urlCacheDetails.data);

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