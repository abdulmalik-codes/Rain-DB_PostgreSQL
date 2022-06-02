const { Router } = require("express");
const router = Router();

const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

const pool = require("../configured/index");
const transporter = require("../configured/email");

const rainUrl = `https://raindbpsql.netlify.app/`;

// ******************************************* //
router
  .route("/")
  // request new password
  .put(
    [check("email", "Please enter a valid email!").isEmail()],
    (request, response, next) => {
      const { email, password, password2 } = request.body;

      pool.query(
        `SELECT email FROM employees WHERE email=($1)`,
        [email],
        async (err, res) => {
          if (err) return next(err);

          if (!email || email === " ") {
            response.json(`Please provide an email address!`);
          } else {
            const errors = validationResult(request);

            if (!errors.isEmpty()) {
              return response.status(400).json({
                errors: errors.array(),
              });
            }

            if (res.rows.length === 0) {
              response.json(`${email} does not exist!`);
            } else {
              if (
                !password ||
                !password2 ||
                password === " " ||
                password2 === " "
              ) {
                response.json(
                  `Input values are missing! Please provide passwords!`
                );
              } else {
                // set new password here

                if (password !== password2) {
                  response.json(`Passwords do not match!`);
                } else {
                  const hashedPassword = await bcrypt.hash(password, 10);

                  pool.query(
                    `UPDATE employees SET password=($1) WHERE email=($2)`,
                    [hashedPassword, email],
                    (err, res) => {
                      if (err) return next(err);
                    }
                  );

                  let forgotPasswordEmail = {
                    from: "62545a@gmail.com",
                    to: `${email}`,
                    subject: `RainSA - Password reset successfully!`,
                    text: `Password reset to: "${password}", login with your email and new password here: ${rainUrl} `,
                  };

                  const info = await transporter.sendMail(forgotPasswordEmail);

                  response.json(`Please check your email!`);
                }
              }
            }
          }
        }
      );
    }
  );

module.exports = router;
