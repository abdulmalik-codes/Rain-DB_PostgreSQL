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

  // response would say forbidden
  if (token == null) return response.sendStatus(401);

  //   check if token matches the secret access token
  jwt.verify(token, jwt_token.ACCESS_TOKEN_SECRET, (err, admin) => {
    if (err) return response.sendStatus(403);

    // setting the admin argument to the request object that I created when the admin logs in
    request.admin = admin;

    next();
  });
}

// ******************************************* //

// methods for all /admin routes
router
  // this route has 2 methods to add and get admins
  .route("/")

  // get method to show the logged in admin's details
  .get((request, response, next) => {
    // gets the details of the admin logged
    pool.query(
      "SELECT * FROM admin WHERE email=($1)",
      // gets the email from the object set in the access token
      [request.admin.email],
      (err, res) => {
        if (err) return next(err);

        // returns the details of the admin
        response.json(res.rows);
      }
    );
  })

  // post method to add admins to db
  .post(
    // middleware to validate input
    [
      check("email", "Please enter a valid email!").isEmail(),
      check(
        "password",
        "Password length should be greater than 5 characters!"
      ).isLength({
        min: 6,
      }),
    ],

    (request, response, next) => {
      try {
        // getting email and password from request body (admins's inputs)
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
          "SELECT * FROM admin WHERE email=($1)",
          [email],
          async (err, res) => {
            if (err) return next(err);

            // if we receive a response that means the email is already in the db
            if (res.rows.length > 0) {
              let adminEmail = res.rows[0].email;

              response.json(`${adminEmail} already exists`);
            } else {
              // if there is no response that means that the email is not in the db

              // encrypting the password
              const hashedPassword = await bcrypt.hash(password, 10);

              // once validation is completed and the password gets encrypted, we can now add the admin to the db
              pool.query(
                "INSERT INTO admin(email, password) VALUES($1, $2)",
                [email, hashedPassword],
                (err, res) => {
                  if (err) return next(err);

                  pool.query(
                    `SELECT * FROM admin WHERE email=($1)`,
                    [email],
                    async (err, res) => {
                      email = res.rows[0].email;
                      password = res.rows[0].password;

                      let welcomeAdminEmail = {
                        from: "62545a@gmail.com",
                        to: `${email}`,
                        subject: `Welcome to RainSA `,
                        text: `Hello ${email},
                        
                        You have been successfully added to the Rain employee database.

                        Log into your account with your email: '${email}' and password: '${password}'. 
                        
                        Link: https://raindbpsql.netlify.app/

                        Thank you and let it Rain!

                        Rain Admin
                        `,
                      };

                      // once email is set up you can now send it
                      const info = await transporter.sendMail(
                        welcomeAdminEmail
                      );

                      response.json(`Email sent`);
                    }
                  );
                }
              );

              response.status(201).json("Admin added successfully");
            }
          }
        );
      } catch {
        response.status(500).send();
      }
    }
  );

// ******************************************* //

// methods for all /admin/employees routes
router
  .route("/employees")
  // view all employees
  .get((request, response, next) => {
    pool.query("SELECT * FROM employees ORDER BY id DESC", (err, res) => {
      if (err) return next(err);

      response.json(res.rows);
    });
  })
  // add employee
  .post(async (request, response, next) => {
    const { name, surname, cell, position, email } = request.body;
    let password = "makeitrain";

    pool.query(
      "INSERT INTO employees(name, surname, cell, position, email, password) VALUES($1, $2, $3, $4, $5, $6)",
      [name, surname, cell, position, email, password],
      (err, res) => {
        if (err) return next(err);
      }
    );

    let welcomeEmail = {
      from: "62545a@gmail.com",
      to: `${email}`,
      subject: `Hello and Welcome to RainSA  ${name}`,
      text: `You have been added to the Rain Employees Database, Login to your account with your email: ${email} and password: ${password}. Please change your password. Link: https://raindbpsql.netlify.app/`,
    };

    const info = await transporter.sendMail(welcomeEmail);
  })
  // delete employees table
  .delete((request, response, next) => {
    pool.query("DROP TABLE employees", (err, res) => {
      if (err) return next(err);

      response.send("Table dropped");
    });
  });

// methods for all /admin/employees/email routes
router
  .route("/employee/:email")
  // view employee by email
  .get((request, response, next) => {
    const { email } = request.params;

    pool.query(
      "SELECT * FROM employees WHERE email=$1",
      [email],
      (err, res) => {
        if (err) return next(err);

        response.json(res.rows);
      }
    );
  })
  // edit employee
  .put((request, response, next) => {
    const { email } = request.params;

    // const keys = [
    //   { name: "name" },
    //   { surname: "surname" },
    //   { cell: "cell" },
    //   { position: "position" },
    //   { password: "password" },
    // ];
    const keys = ["name", "surname", "cell", "position", "password"];
    const details = [];

    keys.forEach((key) => {
      if (request.body[key]) details.push(key);

      details.forEach((detail) => {
        pool.query(
          `UPDATE employees SET ${detail}=($1) WHERE email=($2)`,
          [request.body[detail], email],
          (err, res) => {
            if (err) return next(err);

            // console.log(request.body[detail]);
          }
        );
      });
    });

    pool.query(
      "SELECT * FROM employees WHERE email=($1)",
      [email],
      async (err, res) => {
        if (err) return next(err);

        name = res.rows[0].name;
        surname = res.rows[0].surname;
        cell = res.rows[0].cell;
        position = res.rows[0].position;
        password = res.rows[0].password;

        let updatedEmployee = {
          from: "62545a@gmail.com",
          to: `${email}`,
          subject: `RainSA - Your details updated successfully!`,
          text: `Hello ${name}, 
          
          You recently updated your details on your RainEmployee profile.
          Here are your updated credentials...

          name: ${name}, surname: ${surname}, cell: ${cell}, position: ${position}.

          and to request your password you can click on this link: https://raindbpsql.netlify.app/forgot-password .

          Thank you and let it Rain!

          Rain Admin                          
          `,
        };

        const info = await transporter.sendMail(updatedEmployee);

        response.json("Employee details updated");
      }
    );
  })
  // delete employee
  .delete(async (request, response, next) => {
    const { email } = request.params;

    pool.query(
      "DELETE FROM employees WHERE email=($1)",
      [email],
      (err, res) => {
        if (err) return next(err);
        response.json();
      }
    );

    let deletedEmployee = {
      from: "62545a@gmail.com",
      to: `${email}`,
      subject: `Goodbye from RainSA  ${email}`,
      text: `You have been removed from the Rain Employees Database`,
    };

    const info = await transporter.sendMail(deletedEmployee);
  });

// ******************************************* //

// these are routes for single admin users
router
  .route("/:email")

  // get admin by email
  .get((request, response) => {
    const { email } = request.params;
    pool.query("SELECT * FROM admin WHERE email=$1", [email], (err, res) => {
      if (err) return next(err);

      response.json(res.rows);
    });
  })

  // edit an admin user
  .put(async (request, response, next) => {
    try {
      const { email } = request.params;
      const { password } = request.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      if (password) {
        pool.query(
          `UPDATE admin SET password=($1) WHERE email=($2)`,
          [hashedPassword, email],
          (err, res) => {
            if (err) return next(err);

            // response.send("admin updated");
            response.json(password + " updated");
          }
        );
      }
    } catch {
      response.status(500).send();
    }
  })

  // delete an admin user
  .delete((request, response, next) => {
    const { email } = request.params;

    pool.query("DELETE FROM admin WHERE email=($1)", [email], (err, res) => {
      if (err) return next(err);

      // response.send(`deleted admin ${email} `);
      response.json();
    });
  });

module.exports = router;
