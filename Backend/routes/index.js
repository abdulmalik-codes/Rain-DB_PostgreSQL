// import modules

// router to use imported routes
const { Router } = require("express");
const router = Router();

// import files to use routes
const admin = require("./admin");
const hod = require("./hod");
const employee = require("./employee");
const login = require("./login");
const forgotPassword = require("./forgotPassword");

const fileUpload = require("./file-upload");

// auth access tokens
const accessTokens = require("../secrets/authToken");

// setting a path and the files use for that paths
router.use("/admin", admin);
router.use("/hod", accessTokens.hodToken, hod);
router.use("/employee", accessTokens.employeeToken, employee);
router.use("/login", login);
router.use("/forgot-password", forgotPassword);
router.use("/fileUpload", fileUpload);

module.exports = router;
