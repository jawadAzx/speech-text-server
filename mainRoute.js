const express = require('express');
const router = express.Router();
const multer = require('multer');
const { converter } = require('./test')

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');

router.post("/getData", upload, converter);

module.exports = router;