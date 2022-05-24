// modules imported

// router module from express to create routes in a separate folder/file
const { Router, request } = require("express");
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

// global variables
let rainUrl = `https://raindbpsql.netlify.app/`;

// ******************************************* //

// _____________________________________________ //
// ************ ROUTES FOR ALL USERS *********** //
// _____________________________________________ //

// ******************************************* //

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

        if (res.rows.length === 0) {
          response.json(`Admin does not exist`);
        } else {
          // returns the details of the admin
          response.json(res.rows);
        }
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

        if (!email || !password || email === " " || password === " ") {
          response.json(`Values missing!`);
        } else {
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

                    response.status(201).json("Admin added successfully");
                  }
                );
              }
            }
          );
        }
      } catch {
        response.status(500).send();
      }
    }
  );

// ******************************************* //

// methods for all /admin/departments routes
router
  .route("/departments")

  // view all departments
  .get((request, response, next) => {
    pool.query(`SELECT * FROM departments ORDER BY id DESC`, (err, res) => {
      if (err) return next(err);

      if (res.rows.length === 0) {
        response.json(`No departments in db`);
      } else {
        response.json(res.rows);
      }
    });
  })

  // add a department
  .post((request, response, next) => {
    const { name } = request.body;

    if (!name || name === " ") {
      response.json(`No value inserted`);
    } else {
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

                console.log(res.rows);

                response.status(201).json(`Department created successfully`);
              }
            );
          }
        }
      );
    }
  });

// ******************************************* //

// methods for all /admin/hod routes
router
  .route("/hod")

  // view all hod
  .get((request, response, next) => {
    pool.query(`SELECT * FROM hod ORDER BY id DESC`, (err, res) => {
      if (err) return next(err);

      if (res.rows.length === 0) {
        response.json(`No Hod in the database`);
      } else {
        response.json(res.rows);
      }
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

        if (
          !name ||
          !surname ||
          !cell ||
          !department ||
          !email ||
          name === " " ||
          surname === " " ||
          cell === " " ||
          department === " " ||
          email === " "
        ) {
          response.json(`Input values missing!`);
        } else {
          // generate a new random password every time a hod is added
          let randomPassword = Math.floor(Math.random() * 123456) + 123456;
          // default password for hod
          let password = randomPassword.toString();

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
                      pool.query(
                        `SELECT * FROM hod WHERE department=($1)`,
                        [department],
                        async (err, res) => {
                          if (err) return next(err);

                          if (res.rows.length === 0) {
                            // department exists and is available. can now add the hod

                            // encrypting the password
                            const hashedPassword = await bcrypt.hash(
                              password,
                              10
                            );

                            // validation and encryption completed
                            pool.query(
                              `INSERT INTO hod(name, surname, cell, department, email, password) VALUES($1, $2, $3, $4, $5, $6)`,
                              [
                                name,
                                surname,
                                cell,
                                department,
                                email,
                                hashedPassword,
                              ],
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

                                response
                                  .status(201)
                                  .json(`Hod added successfully`);
                              }
                            );
                          } else {
                            response.json(
                              `Hod already exists in this department`
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
        }
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
    pool.query(`SELECT * FROM employees ORDER BY id DESC`, (err, res) => {
      if (err) return next(err);

      if (res.rows.length === 0) {
        response.json(`No employees in database`);
      } else {
        response.json(res.rows);
      }
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

        if (
          !name ||
          !surname ||
          !cell ||
          !position ||
          !department ||
          !hod ||
          !email ||
          name === " " ||
          surname === " " ||
          cell === " " ||
          position === " " ||
          department === " " ||
          hod === " " ||
          email === " "
        ) {
          response.json(`Input values missing!`);
        } else {
          // generate a new random password every time an employee is added
          let randomPassword = Math.floor(Math.random() * 123456) + 123456;

          // default password for employee
          let password = randomPassword.toString();

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
        }
      } catch {
        response.status(500).send();
      }
    }
  );

// ******************************************* //

// methods for all /admin/view-hod routes
router
  //  this method shows all hod and their departments
  .route("/view-hod")

  // view all hod-department
  .get((request, response, next) => {
    pool.query(
      `SELECT name, department FROM hod ORDER BY id DESC`,
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`No data in db`);
        } else {
          response.json(res.rows);
        }
      }
    );
  });

// ******************************************* //

// methods for all /admin/departments/single-department routes
router
  // this route shows employees in the selected department
  .route("/departments/:department")

  // view all employees in selected department
  .get((request, response, next) => {
    const { department } = request.params;

    pool.query(
      `SELECT name, surname, email FROM employees WHERE department=($1)`,
      [department],
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`Department does not exist`);
        } else {
          response.json(res.rows);
        }
      }
    );
  });

// ******************************************* //

// ________________________________________________ //
// ************ ROUTES FOR SINGLE USERS *********** //
// ________________________________________________ //

// methods for all /admin/department/single-department routes
router
  .route("/department/:name")

  // view department by name
  .get((request, response, next) => {})

  // edit department
  .put((request, response, next) => {})

  // delete department
  .delete((request, response, next) => {});

// ******************************************* //

// methods for all /admin/hod/single-hod routes
router
  .route("/hod/:email")

  // view hod by email
  .get((request, response, next) => {})

  // edit hod
  .put((request, response, next) => {})

  // delete hod
  .delete((request, response, next) => {});

// ******************************************* //

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

        let updatedEmployeeEmail = {
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

        const info = await transporter.sendMail(updatedEmployeeEmail);

        response.json("Employee details updated");
      }
    );
  })

  // delete employee
  .delete((request, response, next) => {
    const { email } = request.params;

    pool.query(
      `SELECT * FROM employees WHERE email=($1)`,
      [email],
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`Employee does not exist`);
        } else {
          // employee exists
          let adminEmail = request.admin.email;
          pool.query(
            `SELECT password FROM admin WHERE email=($1)`,
            [adminEmail],
            async (err, res) => {
              if (err) return next(err);

              let adminPassword = res.rows[0].password;
              let passwordEntered = request.body.password;

              const comparedPassword = await bcrypt.compare(
                passwordEntered,
                adminPassword
              );

              if (!comparedPassword) {
                response.json(`Password is invalid`);
              } else {
                pool.query(
                  "DELETE FROM employees WHERE email=($1)",
                  [email],
                  async (err, res) => {
                    if (err) return next(err);

                    let deletedEmployee = {
                      from: "62545a@gmail.com",
                      to: `${email}`,
                      subject: `Goodbye from RainSA  ${email}`,
                      text: `You have been removed from the Rain Employees Database`,
                    };

                    const info = await transporter.sendMail(deletedEmployee);

                    response.json(`Employee removed from database`);
                  }
                );
              }
            }
          );
        }
      }
    );
  });

// ******************************************* //

// methods for all /admin/single-admin routes
router

  // these are routes for single admin users
  .route("/:email")

  // get admin by email
  .get((request, response) => {
    const { email } = request.params;
    pool.query("SELECT * FROM admin WHERE email=$1", [email], (err, res) => {
      if (err) return next(err);
      if (res.rows.length === 0) {
        response.json(`${email} doesn't exist`);
      } else {
        response.json(res.rows);
      }
    });
  })

  // edit an admin user
  .put((request, response, next) => {
    const { email } = request.params;

    pool.query(
      `SELECT * FROM admin WHERE email=($1)`,
      [email],
      async (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`Admin does not exist`);
        } else {
          try {
            const { password } = request.body;
            const hashedPassword = await bcrypt.hash(password, 10);

            if (password) {
              pool.query(
                `UPDATE admin SET password=($1) WHERE email=($2)`,
                [hashedPassword, email],
                async (err, res) => {
                  if (err) return next(err);

                  let updateAdminEmail = {
                    from: "62545a@gmail.com",
                    to: `${email}`,
                    subject: `Update Successful `,
                    text: `Hello ${email},
                      
                      Your password has been successfully updated. 
  
                      Thank you and let it Rain!
  
                      Rain Admin
                      `,
                  };

                  // once email is set up you can now send it
                  const info = await transporter.sendMail(updateAdminEmail);

                  response.json(`${email} password updated`);
                }
              );
            }
          } catch {
            response.status(500).send();
          }
        }
      }
    );
  })

  // delete an admin user
  .delete((request, response, next) => {
    const { email } = request.params;

    pool.query(`SELECT * FROM admin WHERE email=($1)`, [email], (err, res) => {
      if (err) return next(err);

      if (res.rows.length === 0) {
        response.json(`${email} does not exist`);
      } else {
        pool.query(
          `SELECT password from admin WHERE email=($1)`,
          [email],
          async (err, res) => {
            if (err) return next(err);

            let adminPassword = res.rows[0].password;
            let passwordEntered = request.body.password;
            const comparedPassword = await bcrypt.compare(
              passwordEntered,
              adminPassword
            );

            if (!comparedPassword) {
              response.json(`Password entered is invalid`);
            } else {
              // if the passwords match the admin can be deleted
              pool.query(
                "DELETE FROM admin WHERE email=($1)",
                [email],
                async (err, res) => {
                  if (err) return next(err);

                  // email admin
                  let deletedAdmin = {
                    from: "62545a@gmail.com",
                    to: `${email}`,
                    subject: `Goodbye from RainSA  ${email}`,
                    text: `You have been removed from the Rain Admin Database`,
                  };

                  const info = await transporter.sendMail(deletedAdmin);

                  response.json(`Admin removed from Database`);
                }
              );
            }
          }
        );
      }
    });
  });

module.exports = router;
