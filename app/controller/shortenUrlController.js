const axios = require('axios');
const shortenUrlListModel = require('../model/shortenUrlListModel');
const NodeCache = require('node-cache');
const myCache = new NodeCache();
const apiBaseUrl = process.env.API_BASE_URL;

// Function to shorten a URL
const getShortenUrl = async (req, res) => {
  try {
    console.log('getShortenUrl function')
    console.log(req)
    // Extract the URL to be shortened from the request parameters
    const { url } = req.query;

    // Store data in the cache with a TTL of 60 seconds
    myCache.set('myKey', 'myValue', 60);

    const urlListFromMongo = await shortenUrlListModel.findOne({originalUrl: url},{originalUrl:1, shortenUrl:1});
    console.log(urlListFromMongo);
    if(urlListFromMongo !== null){
      res.status(200).json({ success: true, shortUrl: urlListFromMongo.shortenUrl, orginalUrl: urlListFromMongo.orginalUrl });
    } else{
      let shortUrlDetails = await createShortUrl(url);
        if(shortUrlDetails.success){
          res.status(200).json({ success: true, shortUrl: shortUrlDetails.shortenUrl, orginalUrl: shortUrlDetails.orginalUrl });
        } else {
          res.status(400).json({ success: false, message: 'Failed to shorten URL' });
        }
    }

    /* Fetch all the list of urls from cache.
       If cache is expired or empty fetch from db and store in cache
       First check in cache if the shortUrl for that particular orginalUrl exists or not
       If not exists in cache create the shortUrl and add new url to the cache */

    
  } catch (error) {
    console.error('Error shortening URL:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createShortUrl = async (url)=>{
  try {
    //API to shorten the URL
    const response = await axios.get(apiBaseUrl, {
      params: { 'url': url }
    });

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

// async function fetchItemFromCache(key) {

//   const cachedItem = myCache.get(key);

//   if (cachedItem !== undefined) {
//     // Url List found in the cache
//     console.log('Cached Url List :', cachedItem);
//     return cachedItem;
//   } else {
//     // Item not found in the cache or expired
//     console.log('Url List not found in cache or expired');

//     // Fetch the item from MongoDB (replace this with your MongoDB query)
//     const urlListFromMongo = await shortenUrlListModel.find({},{originalUrl:1, shortenUrl:1});

//     if (urlListFromMongo) {
//       // Store the item in the cache with a TTL (e.g., 60 seconds)
//       myCache.set(key, urlListFromMongo, 60);
//       console.log('Url List fetched from MongoDB and added to cache');
//       return urlListFromMongo;
//     } else {
//       // Handle the case where the item is not found in MongoDB
//       console.log('Url List not found in MongoDB');
//       return null;
//     }
//   }
// }

module.exports = getShortenUrl;


