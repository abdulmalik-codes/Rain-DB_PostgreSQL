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

// global variables
let rainUrl = `https://raindbpsql.netlify.app/`;

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

// _____________________________________________ //
// ************ ROUTES FOR ALL USERS *********** //
// _____________________________________________ //

// router.all method to put jwt all requests with this route
router.all("/", authenticateToken, (request, response, next) => {
  // sets the headers to authorization
  response.header("Authorization", "Bearer");

  next();
});

// methods for all /admin routes
router
  // this route has 2 methods to add and get admins
  .route("/")

  // get method to show the logged in admin's details
  .get((request, response, next) => {
    // gets the details of the admin logged
    pool.query(
      `SELECT * FROM admin WHERE email=($1)`,
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
          `SELECT * FROM admin WHERE email=($1)`,
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
                `INSERT INTO admin(email, password) VALUES($1, $2)`,
                // values takes an array
                [email, hashedPassword],

                async (err, res) => {
                  if (err) return next(err);

                  let welcomeAdminEmail = {
                    from: "62545a@gmail.com",
                    to: `${email}`,
                    subject: `Welcome to RainSA `,
                    text: `Hello ${email},
                    
                    You have been successfully added to the Rain Admin database.

                    Log into your account with your email: '${email}' and password: '${password}'. 
                    
                    Link: ${rainUrl}

                    Thank you and let it Rain!

                    Rain Admin
                    `,
                  };

                  // once email is set up you can now send it
                  const info = await transporter.sendMail(welcomeAdminEmail);

                  response.json(`Email sent`);
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

// router.all method to put jwt all requests with this route
router.all("/departments", authenticateToken, (request, response, next) => {
  // sets the headers to authorization
  response.header("Authorization", "Bearer");

  next();
});

// methods for all /admin/departments routes
router
  .route("/departments")

  // view all departments
  .get((request, response, next) => {
    pool.query(`SELECT * FROM departments ORDER BY id DESC`, (err, res) => {
      if (err) return next(err);

      response.json(res.rows);
    });
  })

  // add a department
  .post((request, response, next) => {
    const { name } = request.body;

    // checking if department exists
    pool.query(
      `SELECT * FROM departments WHERE name=($1)`,
      [name],
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length > 0) {
          response.json(`Department already exists`);
        } else {
          pool.query(
            `INSERT INTO departments(name) VALUES($1)`,
            [name],
            (err, res) => {
              if (err) return next(err);

              response.status(201).json(`Department created successfully`);
            }
          );
        }
      }
    );
  })

  // delete all departments
  .delete((request, response, next) => {
    pool.query(`DROP TABLE IF EXISTS departments`, (err, res) => {
      if (err) return next(err);

      response.json(`Departments table deleted successfully!`);
    });
  });

// ******************************************* //

// router.all method to put jwt all requests with this route
router.all("/hod", authenticateToken, (request, response, next) => {
  // sets the headers to authorization
  response.header("Authorization", "Bearer");

  next();
});

// methods for all /admin/hod routes
router
  .route("/hod")

  // view all hod
  .get((request, response, next) => {
    pool.query(`SELECT * FROM hod ORDER BY id DESC`, (err, res) => {
      if (err) return next(err);

      response.json(res.rows);
    });
  })

  // add a hod
  .post(
    // middleware to validate inputs
    [check("email", "Please enter a valid email!").isEmail()],

    (request, response, next) => {
      try {
        // getting details from request body (hod's inputs)
        const { name, surname, cell, department, email } = request.body;

        // default password for hod
        let password = "RainRules!";

        // validationResult takes in the request body as an argument and returns an array of errors
        const errors = validationResult(request);

        // check if there are any errors and if there are return the errors in a json response
        if (!errors.isEmpty()) {
          return response.status(400).json({
            errors: errors.array(),
          });
        }

        // validation passed, now check if email exists
        pool.query(
          `SELECT * FROM hod WHERE email=($1)`,
          [email],
          (err, res) => {
            if (err) return next(err);

            // if there's a response then it means that the email exists
            if (res.rows.length > 0) {
              let hodName = res.rows[0].name;
              let hodDepartment = res.rows[0].department;

              response.json(
                `${hodName} is the Head of ${hodDepartment}, cannot assign more responsibilities!`
              );
            } else {
              // no response means email is available

              // now we check if the department entered exists
              pool.query(
                `SELECT * FROM departments WHERE name=($1)`,
                [department],
                async (err, res) => {
                  if (err) return next(err);
                  if (res.rows.length === 0) {
                    response.json(`${department} department does not exist`);
                  } else {
                    // department exists and can now add the hod

                    // encrypting the password
                    const hashedPassword = await bcrypt.hash(password, 10);

                    // validation and encryption completed
                    pool.query(
                      `INSERT INTO hod(name, surname, cell, department, email, password) VALUES($1, $2, $3, $4, $5, $6)`,
                      [name, surname, cell, department, email, hashedPassword],
                      async (err, res) => {
                        if (err) return next(err);

                        let welcomeHodEmail = {
                          from: "62545a@gmail.com",
                          to: `${email}`,
                          subject: `Welcome to RainSA ${name}`,
                          text: `Hello ${name},                          

                          You have been successfully added to the Rain Hod database.

                          Log into your account with your email: '${email}' and password: '${password}'.
                  
                          NB! MAKE SURE TO CHANGE YOUR PASSWORD!!!

                          link: ${rainUrl}

                          Thank you and let it Rain!

                          Rain Admin                  
                  `,
                        };

                        // once email is set up, it gets sent
                        const info = await transporter.sendMail(
                          welcomeHodEmail
                        );

                        response.status(201).json(`Hod added successfully`);
                      }
                    );
                  }
                }
              );
            }
          }
        );
      } catch {
        response.status(500).send();
      }
    }
  )

  // delete all hod
  .delete((request, response, next) => {
    pool.query(`DROP TABLE IF EXISTS hod`, (err, res) => {
      if (err) return next(err);

      response.json(`Hod table deleted successfully!`);
    });
  });

// ******************************************* //

// router.all method to put jwt all requests with this route
router.all("/view-hod", authenticateToken, (request, response, next) => {
  // sets the headers to authorization
  response.header("Authorization", "Bearer");

  next();
});

// methods for all /admin/view-hod routes
router
  .route("/view-hod")

  // view all hod-department
  .get((request, response, next) => {
    pool.query(
      `SELECT name, department FROM hod ORDER BY id DESC`,
      (err, res) => {
        if (err) return next(err);

        response.json(res.rows);
      }
    );
  });

// ******************************************* //

// router.all method to put jwt all requests with this route
router.all("/employees", authenticateToken, (request, response, next) => {
  // sets the headers to authorization
  response.header("Authorization", "Bearer");

  next();
});

// methods for all /admin/employees routes
router
  .route("/employees")

  // view all employees
  .get((request, response, next) => {
    pool.query(`SELECT * FROM employees ORDER BY id DESC`, (err, res) => {
      if (err) return next(err);
      response.json(res.rows);
    });
  })

  // add employee
  .post(
    // middleware to validate inputs
    [check("email", "Please enter a valid email!").isEmail()],

    (request, response, next) => {
      try {
        // getting details from request body (employees's inputs)
        const { name, surname, cell, position, department, hod, email } =
          request.body;

        // default password for employee
        let password = "makeitrain";

        // validationResult takes in the request body as an argument and returns an array of errors
        const errors = validationResult(request);

        // check if there are any errors and if there are return the errors in a json response
        if (!errors.isEmpty()) {
          return response.status(400).json({
            errors: errors.array(),
          });
        }

        // validation passed, now check if email exists
        pool.query(
          `SELECT * FROM employees WHERE email=($1)`,
          [email],
          (err, res) => {
            if (err) return next(err);

            // if there's a response then it means that the email exists
            if (res.rows.length > 0) {
              let employeeEmail = res.rows[0].email;
              let employeeName = res.rows[0].name;
              let employeeSurname = res.rows[0].surname;

              response.json(
                `${employeeName} ${employeeSurname} already has this email address '${employeeEmail}'`
              );
            } else {
              // no response means email is available

              // now check if department exist
              pool.query(
                `SELECT * FROM departments WHERE name=($1)`,
                [department],
                (err, res) => {
                  if (err) return next(err);

                  if (res.rows.length === 0) {
                    response.json(`${department} department does not exist`);
                  } else {
                    // if the department does exists

                    // now check if the hod exists

                    pool.query(
                      `SELECT * FROM hod WHERE email=($1)`,
                      [hod],
                      async (err, res) => {
                        if (err) return next(err);

                        if (res.rows.length === 0) {
                          response.json(`${hod} is not a Head of Department`);
                        } else {
                          // now we can finally add the employee to db

                          // encrypting the password
                          const hashedPassword = await bcrypt.hash(
                            password,
                            10
                          );

                          // validation and encryption completed
                          pool.query(
                            `INSERT INTO employees(name, surname, cell, position, department, hod, email, password) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
                            [
                              name,
                              surname,
                              cell,
                              position,
                              department,
                              hod,
                              email,
                              hashedPassword,
                            ],
                            async (err, res) => {
                              if (err) return next(err);

                              let welcomeEmployeeEmail = {
                                from: "62545a@gmail.com",
                                to: `${email}`,
                                subject: `Welcome to RainSA ${name}`,
                                text: `Hello ${name},                                

                                You have been successfully added to the Rain Employees database.
                                                              
                                Log into your account with your email: '${email}' and password: '${password}'.
                                                              
                                NB! MAKE SURE TO CHANGE YOUR PASSWORD!!!
                                                              
                                link: ${rainUrl}
                                                              
                                Thank you and let it Rain!
                                                              
                                Rain Admin                  
`,
                              };

                              // once email is set up, it gets sent
                              const info = await transporter.sendMail(
                                welcomeEmployeeEmail
                              );

                              response
                                .status(201)
                                .json(`Employee added successfully`);
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      } catch {
        response.status(500).send();
      }
    }
  )

  // delete employees table
  .delete((request, response, next) => {
    pool.query(`DROP TABLE IF EXISTS employees`, (err, res) => {
      if (err) return next(err);

      response.json(`Employees table deleted successfully!`);
    });
  });

// ******************************************* //

// ________________________________________________ //
// ************ ROUTES FOR SINGLE USERS *********** //
// ________________________________________________ //

// methods for all /admin/employees/single-employee routes
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
