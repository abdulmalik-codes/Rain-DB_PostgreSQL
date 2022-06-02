const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const port = require("./bin/www");
const routes = require("./routes");

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(
  fileUpload({
    createParentPath: true,
  })
);

app.use("/", routes);

module.exports = app;
