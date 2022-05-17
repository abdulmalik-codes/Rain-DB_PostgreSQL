const { Router } = require("express");

const admin = require("./admin");
const employee = require("./employee");
const login = require("./login");
const forgotPassword = require("./forgotPassword");

const router = Router();

router.use("/admin", admin);
router.use("/employee", employee);
router.use("/login", login);
router.use("/forgot-password", forgotPassword);

module.exports = router;
