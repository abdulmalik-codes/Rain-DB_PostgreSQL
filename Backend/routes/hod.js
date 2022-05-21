// modules imported

// router module from express to create routes in a separate folder/file
const { Router } = require("express");
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
        const { email, password } = request.body;

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
            }
          }
        );
      } catch {
        response.status(500).send();
      }
    }
  );
