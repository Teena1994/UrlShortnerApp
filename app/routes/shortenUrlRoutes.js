const express = require('express');
const router = express.Router();
const { getShortenUrl, redirectShortenUrl } = require('./../controller/shortenUrlController');

router.post('/', getShortenUrl);
router.get('/', redirectShortenUrl);

module.exports = router;

