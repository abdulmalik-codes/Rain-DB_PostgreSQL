const { Router } = require("express");

const admin = require("./admin");
const employee = require("./employee");

const router = Router();

router.use("/admin", admin);
// router.use("/employee", employee);

module.exports = router;
