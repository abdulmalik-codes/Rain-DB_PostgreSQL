const { Router } = require("express");
const router = Router();

const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

const pool = require("../configured/index");
const transporter = require("../configured/email");

// ******************************************* //

router
  .route("/")

  .get((request, response, next) => {
    const email = request.hod.email;
    pool.query("SELECT * FROM hod WHERE email=($1)", [email], (err, res) => {
      if (err) return next(err);

      if (res.rows.length === 0) {
        response.json(`Hod not assigned!`);
      } else {
        pool.query(
          `SELECT * FROM employees WHERE email=($1)`,
          [email],
          (err, res) => {
            if (err) return next(err);

            response.json(res.rows);
          }
        );
      }
    });
  });

// ******************************************* //

// methods for all /hod/employees routes
router
  .route("/employees")

  // show all employees
  .get((request, response, next) => {})

  // add employee to hod department
  .post((request, response, next) => {});

// ******************************************* //

// methods for all /hod/:hod-email routes
router
  .route("/:hod-email")

  // no need for a get method with this email because our login function takes care of this already
  .get((request, response, next) => {
    // gets the email from the url path
    const { email } = request.params;

    // sql query to get hod from db
    pool.query(`SELECT * FROM hod WHERE email=($1)`, [email], (err, res) => {
      if (err) return next(err);

      // hod details returned
      response.json(res.rows);
    });
  })
  // put method to edit and update the hod's details
  .put((request, response, next) => {
    try {
      // getting the email from the path
      const { email } = request.params;

      // setting keys for the input
      const keys = ["name", "surname", "cell", "department", "password"];

      // an array to store all the details
      const details = [];

      // if there is a value in the key that needs to be updated this method takes care of it
      keys.forEach((key) => {
        // store the keys in the details array if there are any
        if (request.body[key]) details.push(key);

        // for each detail, update its value
        details.forEach((detail) => {
          pool.query(
            `UPDATE hod SET ${detail}=($1) WHERE email=($2)`,

            // get the value of detail from the request body
            [request.body[detail], email],

            (err, res) => {
              if (err) return next(err);

              response.json(`Details updated`);
            }
          );
        });
      });

      // getting the updated password from the table and encrypting it again
      pool.query(
        `SELECT password FROM hod WHERE email=($1)`,
        [email],
        async (err, res) => {
          if (err) return next(err);

          // password from the response
          const hodPassword = res.rows[0].password;

          // encrypting the password
          const hashedPassword = await bcrypt.hash(hodPassword, 10);

          pool.query(
            `UPDATE hod SET password=($1) WHERE email=($2)`,
            [hashedPassword, email],
            (err, res) => {
              if (err) return next(err);

              response.json(`Password encrypted successfully`);
            }
          );
        }
      );

      // after all details are updated we can now notify the account holder with an email

      // first we get all the details
      pool.query(
        `SELECT * FROM hod WHERE email=($1)`,
        [email],
        async (err, res) => {
          if (err) return next(err);

          // getting the hod details
          name = res.rows[0].name;
          surname = res.rows[0].surname;
          cell = res.rows[0].cell;
          department = res.rows[0].department;
          password = res.rows[0].password;

          // object that hold email details that needs to be sent
          let updateHod = {
            from: "62545a@gmail.com",
            to: `${email}`,
            subject: `RainSA - Your details updated successfully!`,
            text: `Hello ${name},
            
            you recently updated your details on your RainEmployee profile. 
            Here are your updated credentials...
            name: ${name}, surname: ${surname}, cell: ${cell}, department: ${department}.

            and to request your password you can click on this link: https://raindbpsql.netlify.app/forgot-password .

            Thank you and let it Rain!

            Rain Admin            
            `,
          };

          // once email is set up you can now send it
          const info = await transporter.sendMail(updateHod);

          response.json(`Hod email sent`);
        }
      );
    } catch {
      response.status(500).send();
    }
  });

// ******************************************* //

// export this file using router variable to use externally
module.exports = router;
