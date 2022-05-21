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
  });

//   post method to add hod users to the hod table
