const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const port = require("./bin/www");
const routes = require("./routes");

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

const app = express();

app.use(bodyParser.json());
app.use(cors());
// app.use(cors(corsOptions));
app.use(fileUpload());
app.use("/", routes);

module.exports = app;
