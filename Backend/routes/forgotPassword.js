const { Router } = require("express");
const router = Router();
const pool = require("../db/index");
const transporter = require("../db/email");

router.route("/employees").post((request, response, next) => {
  const { email } = request.body;

  pool.query(
    "SELECT password FROM employees WHERE email=($1)",
    [email],
    async (err, res) => {
      if (err) return next(err);

      if (res.rows.length > 0) {
        if ((res.rows[0].email = email)) {
          password = res.rows[0].password;

          let forgotPasswordEmail = {
            from: "62545a@gmail.com",
            to: `${email}`,
            subject: `Password reset`,
            text: `Requested password for ${email} is: "${password}", login with email and password here: https://raindbpsql.netlify.app/ `,
          };

          const info = await transporter.sendMail(forgotPasswordEmail);

          response.json("Please check your email");
        }
      } else {
        response.json("Email not in DB");
      }
    }
  );
});

module.exports = router;
