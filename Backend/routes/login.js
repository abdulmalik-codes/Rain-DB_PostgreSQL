const { Router } = require("express");
const router = Router();
const pool = require("../db/index");

// login admin
router.route("/").post((request, response, next) => {
  const { email, password } = request.body;

  pool.query("SELECT * FROM admin WHERE email=($1)", [email], (err, res) => {
    if (err) return next(err);

    if (res.rows.length > 0) {
      let adminPassword = res.rows[0].password;

      if (adminPassword === password) {
        console.log("Login success");
        response.json("Login success");
      } else {
        console.log("Incorrect Password");
        response.json("Incorrect Password");
      }
    } else {
      console.log("no email exists");
      response.json("Employee Does not Exist");
    }
  });
});

module.exports = router;

// when trying to update the user try to send email using req.rows results
