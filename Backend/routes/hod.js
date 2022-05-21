// modules imported

// router module from express to create routes in a separate folder/file
const { Router, response } = require("express");
// creating a router variable to call the router function
const router = Router();

// bcrypt to encrypt passwords
const bcrypt = require("bcrypt");

// jwt to protect express routes
const jwt = require("jsonwebtoken");

// validation to check if input meets requirements
const { check, validationResult } = require("express-validator");

// import configured files

// connection to postgres
const pool = require("../configured/index");

// connection to email service
const transporter = require("../configured/email");

// connection to jwt token
const jwt_token = require("../secrets/jwt");

// ******************************************* //

// function to authenticate jwt token
function authenticateToken(request, response, next) {
  // setting header to 'authorization'
  const authHeader = request.headers["authorization"];

  //   token = authHeader and auth header is {'authorization' 'bearer'}
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return response.sendStatus(401);

  //   check if token matches the secret access token
  jwt.verify(token, jwt_token.ACCESS_TOKEN_SECRET, (err, hod) => {
    if (err) return response.sendStatus(403);

    // setting the hod argument to the request object that I created when the hod logs in
    request.hod = hod;

    next();
  });
}

// ******************************************* //

// router.all method to put jwt all requests with this route
router.all("/", (request, response, next) => {
  // sets the headers to authorization
  response.header("Authorization", "Bearer");

  next();
});

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
  })

  //   post method to add hod users to the hod table
  .post(
    // some middleware to validate check input
    [
      check("email", "Please enter a valid email!").isEmail(),
      check(
        "password",
        "Password length should be greater than 5 characters!"
      ).isLength({ min: 6 }),
    ],

    (request, response, next) => {
      try {
        // getting email and password from request body (user's inputs)
        const { name, surname, cell, department, email, password } =
          request.body;

        // validationResult takes in the request body as an argument and returns an array of errors
        const errors = validationResult(request);

        // check if there are any errors and if there are return the errors in a json response
        if (!errors.isEmpty()) {
          return response.status(400).json({
            errors: errors.array(),
          });
        }

        // after inputs passes validation check, I now look to see if the email they inputted already exists
        pool.query(
          "SELECT * FROM hod WHERE email=($1)",
          [email],
          async (err, res) => {
            if (err) return next(err);

            // if we receive a response that means the email is already in the db
            if (res.rows.length > 0) {
              let hodEmail = res.rows[0].email;

              response.json(`${hodEmail} already exists`);
            } else {
              // if there is no response that means that the email is not in the db

              // creating a hashed password
              const hashedPassword = await bcrypt.hash(password, 10);

              // once validation is completed and the password gets encrypted, we can now add the user to the db
              pool.query(
                `INSERT INTO hod(name, surname, cell, department, email, password) VALUES($1, $2, $3, $4, $5, $6)`,
                [name, surname, cell, department, email, hashedPassword]
              );

              response.status(201).json("hod added successfully");
            }
          }
        );
      } catch {
        response.status(500).send();
      }
    }
  );

// ******************************************* //

// router.all method to secure all routes with this path
router.all("/:hod-email", (request, response, next) => {
  // sets the headers to authorization
  response.header("Authorization", "Bearer");

  next();
});

// methods for all /hod/:hod-email routes
router
  .route("/:hod-email")

  // no need for a get method with this email because our login function takes care of this already

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

// export this file using router variable to use externally
module.exports = router;
