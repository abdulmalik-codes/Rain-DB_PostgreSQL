// modules imported

// router module from express to create routes in a separate folder/file
const { Router } = require("express");
// creating a router variable to call the router function
const router = Router();

// bcrypt to encrypt passwords
const bcrypt = require("bcrypt");

// validation to check if input meets requirements
const { check, validationResult } = require("express-validator");

// import configured files

// connection to postgres
const pool = require("../configured/index");

// connection to email service
const transporter = require("../configured/email");

// ******************************************* //

// methods for all /hod routes
router
  .route("/")

  // get method to show the logged in hod's details
  .get((request, response, next) => {
    // gets the details of the hod logged
    pool.query(
      "SELECT * FROM hod WHERE email=($1)",
      // gets the email from the object set in the access token
      [request.hod.email],
      (err, res) => {
        if (err) return next(err);

        // returns the details of the hod
        response.json(res.rows);
      }
    );
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
