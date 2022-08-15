'use-strict';
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./mainRoute');
const dotenv = require('dotenv');
dotenv.config();
const {
    PORT,
} = process.env;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json())
app.use(routes);

app.listen(PORT || 8080);
