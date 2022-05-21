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

// setting a path and the files use for that paths
router.use("/admin", admin);
router.use("/hod", hod);
router.use("/employee", employee);
router.use("/login", login);
router.use("/forgot-password", forgotPassword);

module.exports = router;
