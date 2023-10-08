const express = require('express');
const router = express.Router();
const getShortenUrl = require('./../controller/shortenUrlController');

router.post('/', getShortenUrl);
module.exports = router;

