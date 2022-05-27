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

    if (!request.admin) {
      response.json(`Admin does not Exist!`);
    } else {
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
    }
  })

  // post method to add admins to db
  .post(
    // middleware to validate input
    [check("email", "Please enter a valid email!").isEmail()],

    (request, response, next) => {
      try {
        // getting email from request body (admins's inputs)
        const { email } = request.body;

        if (!email || email === " ") {
          response.json(
            `Input values missing! Please provide an email to add an Admin!`
          );
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

                // generate a random password
                randomPassword = () => {
                  let password = "";
                  let characters = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*`;

                  for (let i = 0; i < 6; i++) {
                    password += characters.charAt(
                      Math.floor(Math.random() * characters.length)
                    );
                  }
                  return password;
                };
                password = randomPassword();
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
        response.json(`Departments in database is empty!`);
      } else {
        response.json(res.rows);
      }
    });
  })

  // add a department
  .post((request, response, next) => {
    const { department } = request.body;

    if (!department || department === " ") {
      response.json(`No values inserted! Please provide a Department name!`);
    } else {
      // checking if department exists
      pool.query(
        `SELECT * FROM departments WHERE department=($1)`,
        [department],
        (err, res) => {
          if (err) return next(err);

          if (res.rows.length > 0) {
            response.json(`${department} is already an existing department!`);
          } else {
            pool.query(
              `INSERT INTO departments(department) VALUES($1)`,
              [department],
              (err, res) => {
                if (err) return next(err);

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
        response.json(`HOD in database is empty!`);
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
        const { email, department } = request.body;

        if (!email || !department || email === " " || department === " ") {
          response.json(
            `Input values missing! Please provide an email address and a department name! `
          );
        } else {
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

              if (res.rows.length === 0) {
                // no response means hod cannot be added
                response.json(
                  `${email} is not a RainSA employee! Please provide an existing email address!`
                );
              } else {
                // now we check if the department entered exists
                pool.query(
                  `SELECT * FROM departments WHERE department=($1)`,
                  [department],
                  async (err, res) => {
                    if (err) return next(err);
                    if (res.rows.length === 0) {
                      response.json(`${department} department does not exist!`);
                    } else {
                      // now check if department has an hod
                      pool.query(
                        `SELECT * FROM hod WHERE department=($1)`,
                        [department],
                        async (err, res) => {
                          if (err) return next(err);

                          // if there's a response it means department already has a hod
                          if (res.rows.length > 0) {
                            hodEmail = res.rows[0].email;
                            response.json(
                              ` ${department} department already assigned to ${hodEmail}!`
                            );
                          } else {
                            // no response mean that department needs hod
                            pool.query(
                              `SELECT * FROM hod WHERE email=($1)`,
                              [email],
                              (err, res) => {
                                if (err) return next(err);

                                // check if the employee is already a hod
                                if (res.rows.length > 0) {
                                  let department = res.rows[0].department;
                                  response.json(
                                    `${email} is already Head of the ${department} department`
                                  );
                                } else {
                                  // department exists and is available. can now add the hod

                                  pool.query(
                                    `SELECT * FROM admin WHERE email=($1)`,
                                    [request.admin.email],
                                    (err, res) => {
                                      if (err) return next(err);

                                      if (res.rows.length === 0) {
                                        response.json(
                                          `Cannot add Hod because Admin does not exist!`
                                        );
                                      } else {
                                        // create a function to add date employee was promoted
                                        const d = new Date();
                                        let date = d.toLocaleDateString();

                                        // validation and encryption completed
                                        pool.query(
                                          `INSERT INTO hod(email, department, admin, promoted) VALUES($1, $2, $3, $4)`,
                                          [
                                            email,
                                            department,
                                            request.admin.email,
                                            date,
                                          ],
                                          async (err, res) => {
                                            if (err) return next(err);

                                            let welcomeHodEmail = {
                                              from: "62545a@gmail.com",
                                              to: `${email}`,
                                              subject: `Congratulations from RainSA!`,
                                              text: `Hello ${email},                          

                                        You have been successfully assigned to be the Head of the ${department} department.

                                        link: ${rainUrl}

                                        Thank you and let it Rain!

                                        Rain Admin`,
                                            };

                                            pool.query(
                                              `UPDATE employees SET position=($1), department=($2) WHERE email=($3)`,
                                              [
                                                `Head of ${department}`,
                                                `${department}`,
                                                email,
                                              ]
                                            );

                                            // once email is set up, it gets sent
                                            const info =
                                              await transporter.sendMail(
                                                welcomeHodEmail
                                              );

                                            response
                                              .status(201)
                                              .json(`Hod added successfully`);
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
        response.json(`No employees in the RainSA database!`);
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
        const { name, surname, cell, position, department, email } =
          request.body;

        if (
          !name ||
          !surname ||
          !cell ||
          !position ||
          !department ||
          !email ||
          name === " " ||
          surname === " " ||
          cell === " " ||
          position === " " ||
          department === " " ||
          email === " "
        ) {
          response.json(
            `Input values missing! Please make sure to fill in all required fields!`
          );
        } else {
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
                let employeeDepartment = res.rows[0].department;

                response.json(
                  `${employeeName} ${employeeSurname} from ${employeeDepartment}, already has this email address: ${employeeEmail} !`
                );
              } else {
                // no response means email is available

                // now check if department exist
                pool.query(
                  `SELECT * FROM departments WHERE department=($1)`,
                  [department],
                  async (err, res) => {
                    if (err) return next(err);

                    if (res.rows.length === 0) {
                      response.json(`${department} department does not exist!`);
                    } else {
                      // the department does exist

                      // generate a new random password every time an employee is added
                      randomPassword = () => {
                        let password = "";
                        let characters = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*`;

                        for (let i = 0; i < 6; i++) {
                          password += characters.charAt(
                            Math.floor(Math.random() * characters.length)
                          );
                        }
                        return password;
                      };

                      // default password for employee
                      let password = randomPassword();

                      // encrypting the password
                      const hashedPassword = await bcrypt.hash(password, 10);

                      // validation and encryption completed

                      // create a function to add date account was created
                      const d = new Date();
                      let date = d.toLocaleDateString();

                      // now we can finally add the employee to db
                      pool.query(
                        `INSERT INTO employees(name, surname, cell, position, department, joined, email, password) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
                        [
                          name,
                          surname,
                          cell,
                          position,
                          department,
                          date,
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
                                                        
                          Rain Admin`,
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
      `SELECT email, department FROM hod ORDER BY id DESC`,
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`No Hod's in the RainSA database!`);
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
  .route("/departments/:departmentName")
  // this route shows employees in the selected department
  .get((request, response, next) => {
    const { departmentName } = request.params;

    pool.query(
      `SELECT * FROM departments WHERE department=($1)`,
      [departmentName],
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`${departmentName} department does not exist!`);
        } else {
          pool.query(
            `SELECT name, surname, position, email FROM employees WHERE department=($1)`,
            [departmentName],
            (err, res) => {
              if (err) return next(err);

              if (res.rows.length === 0) {
                response.json(
                  `No employees in the ${departmentName} department!`
                );
              } else {
                response.json(res.rows);
              }
            }
          );
        }
      }
    );
  })

  // edit and delete  department
  .put((request, response, next) => {
    // THIS METHODS WILL NOT WORK!
  })
  .delete((request, response, next) => {
    // NOT ABLE TO EDIT OR DELETE TABLES WITH FK CONSTRAINTS!
  });

// ******************************************* //

// methods for all /admin/hod/single-hod routes
router
  .route("/hod/:email")

  // view hod by email
  .get((request, response, next) => {
    const { email } = request.params;

    pool.query(
      `SELECT * FROM employees WHERE email=($1)`,
      [email],
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`${email} is not a RainSA employee!`);
        } else {
          pool.query(
            `SELECT * FROM hod WHERE email=($1)`,
            [email],
            (err, res) => {
              if (err) return next(err);

              if (res.rows.length === 0) {
                response.json(`${email} has not been assigned as Hod!`);
              } else {
                response.json(res.rows);
              }
            }
          );
        }
      }
    );
  })

  // edit hod
  .put((request, response, next) => {
    try {
      // getting the email from the path
      const { email } = request.params;
      let { department } = request.body;

      pool.query(
        `SELECT * FROM employees WHERE email=($1)`,
        [email],
        (err, res) => {
          if (err) return next(err);

          if (res.rows.length === 0) {
            response.json(`${email} is not a RainSA employee!`);
          } else {
            pool.query(
              `SELECT * FROM hod WHERE email=($1)`,
              [email],
              (err, res) => {
                if (err) return next(err);

                if (res.rows.length === 0) {
                  response.json(`${email} has not been assigned as Hod!`);
                } else {
                  pool.query(
                    `SELECT * FROM departments WHERE department=($1)`,
                    [department],
                    (err, res) => {
                      if (err) return next(err);

                      if (res.rows.length === 0) {
                        response.json(
                          `${department} is not a RainSA department!`
                        );
                      } else {
                        pool.query(
                          `SELECT * FROM hod WHERE department=($1)`,
                          [department],
                          (err, res) => {
                            if (err) return next(err);
                            if (res.rows.length > 0) {
                              hodEmail = res.rows[0].email;
                              response.json(
                                `${department} department already assigned to ${hodEmail}!`
                              );
                            } else {
                              // department available
                              // hod can be promoted to new department

                              // checks if the token is authentic
                              pool.query(
                                `SELECT * FROM admin WHERE email=($1)`,
                                [request.admin.email],
                                (err, res) => {
                                  if (err) return next(err);

                                  if (res.rows.length === 0) {
                                    response.json(
                                      `Admin account does not exist!`
                                    );
                                  } else {
                                    // create a function to add the date hod was promoted again
                                    const d = new Date();
                                    let date = d.toLocaleDateString();

                                    // update query
                                    pool.query(
                                      `UPDATE hod SET department=($1), admin=($2), promoted=($3) WHERE email=($4)`,
                                      [
                                        department,
                                        request.admin.email,
                                        date,
                                        email,
                                      ],
                                      (err, res) => {
                                        if (err) return next(err);

                                        // after all details are updated we can now notify the account holder with an email

                                        // first we get all the details
                                        pool.query(
                                          `SELECT * FROM hod WHERE email=($1)`,
                                          [email],
                                          async (err, res) => {
                                            if (err) return next(err);

                                            // getting the hod details
                                            department = res.rows[0].department;

                                            // object that hold email details that needs to be sent
                                            let updateHodEmail = {
                                              from: "62545a@gmail.com",
                                              to: `${email}`,
                                              subject: `Congratulations from RainSA!`,
                                              text: `Hello,
            
                                              You have been re-assigned as Head of the ${department} department.
                                                  
                                              Good luck on your new journey.
                                                  
                                              Thank you and let it Rain!
                                                  
                                              Rain Admin`,
                                            };

                                            pool.query(
                                              `UPDATE employees SET position=($1), department=($2) WHERE email=($3)`,
                                              [
                                                `Head of ${department}`,
                                                `${department}`,
                                                email,
                                              ]
                                            );

                                            // once email is set up you can now send it
                                            const info =
                                              await transporter.sendMail(
                                                updateHodEmail
                                              );

                                            response.json(
                                              `Hod's details validated, encrypted, updated, and sent via email!`
                                            );
                                          }
                                        );
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
              }
            );
          }
        }
      );
    } catch {
      response.status(500).send();
    }
  })

  // delete hod from db
  .delete((request, response, next) => {
    // pulls email from url path
    const { email } = request.params;

    pool.query(
      `SELECT * FROM employees WHERE email=($1)`,
      [email],
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`${email} is not a RainSA employee!`);
        } else {
          pool.query(
            `SELECT * FROM hod WHERE email=($1)`,
            [email],
            (err, res) => {
              if (err) return next(err);

              if (res.rows.length === 0) {
                response.json(`${email} has not been assigned as Hod!`);
              } else {
                let adminEmail = request.admin.email;
                let department = res.rows[0].department;
                pool.query(
                  `SELECT * FROM admin WHERE email=($1)`,
                  [adminEmail],
                  async (err, res) => {
                    if (err) return next(err);

                    if (res.rows.length === 0) {
                      response.json(`Admin does not exist!`);
                    } else {
                      let adminPassword = res.rows[0].password;
                      let passwordEntered = request.body.password;

                      const comparedPassword = await bcrypt.compare(
                        passwordEntered,
                        adminPassword
                      );

                      if (!comparedPassword) {
                        response.json(`Password Invalid!`);
                      } else {
                        // query to delete hod
                        pool.query(
                          `DELETE FROM hod WHERE email=($1)`,
                          [email],
                          async (err, res) => {
                            if (err) return next(err);

                            let deletedHodEmail = {
                              from: "62545a@gmail.com",
                              to: `${email}`,
                              subject: `Goodbye from RainSA`,
                              text: `Hello and Goodbye,
              
                              You have been removed from the Rain Hod database

                              We hope we have parted on good terms and that you'll continue to support RainSA unconditionally

                              Thank you and good luck with your future endeavors

                              Rain Admin`,
                            };

                            pool.query(
                              `UPDATE employees SET position=($1) WHERE email=($2)`,
                              [`Part of ${department}`, email]
                            );

                            // email will be sent
                            const info = await transporter.sendMail(
                              deletedHodEmail
                            );

                            response.json(`${email} has been demoted!`);
                          }
                        );
                      }
                    }
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

// methods for all /admin/employees/single-employee routes
router
  .route("/employees/:email")

  // view employee by email
  .get((request, response, next) => {
    const { email } = request.params;

    pool.query(
      `SELECT * FROM employees WHERE email=($1)`,
      [email],
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`${email} is not a RainSA employee!`);
        } else {
          response.json(res.rows);
        }
      }
    );
  })

  // edit employee
  .put((request, response, next) => {
    const { email } = request.params;

    pool.query(
      `SELECT * FROM employees WHERE email=($1)`,
      [email],
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`${email} is not a RainSA employee!`);
        } else {
          const keys = [
            "name",
            "surname",
            "cell",
            "position",
            "department",
            "password",
          ];
          const details = [];

          keys.forEach((key) => {
            if (request.body[key] && request.body[key] !== " ") {
              details.push(key);
            }
          });

          if (details.length === 0) {
            response.json(
              `Input values missing! Please insert into all required fields!`
            );
          } else {
            details.forEach((detail) => {
              pool.query(
                `UPDATE employees SET ${detail}=($1) WHERE email=($2)`,
                [request.body[detail], email],
                (err, res) => {
                  if (err) return next(err);
                }
              );
            });

            pool.query(
              `SELECT * FROM employees WHERE email=($1)`,
              [email],
              async (err, res) => {
                if (err) return next(err);

                name = res.rows[0].name;
                surname = res.rows[0].surname;
                cell = res.rows[0].cell;
                position = res.rows[0].position;
                department = res.rows[0].department;

                password = res.rows[0].password;
                const hashedPassword = await bcrypt.hash(password, 10);

                pool.query(
                  `UPDATE employees SET password=($1) WHERE email=($2)`,
                  [hashedPassword, email],
                  async (err, res) => {
                    if (err) return next(err);

                    let updatedEmployeeEmail = {
                      from: "62545a@gmail.com",
                      to: `${email}`,
                      subject: `RainSA - Your details updated successfully!`,
                      text: `Hello ${name}, 
                  
                  Your details on your Rain Employee profile was recently updated by the Rain Admin team.
                  Here are your updated credentials...
        
                  name: ${name}, surname: ${surname}, cell: ${cell}, position: ${position}, department: ${department} .
        
                  and to request your password you can click on this link: https://raindbpsql.netlify.app/forgot-password .
        
                  Thank you and let it Rain!
        
                  Rain Admin`,
                    };

                    const info = await transporter.sendMail(
                      updatedEmployeeEmail
                    );

                    response.json(`${email}'s details updated successfully!`);
                  }
                );
              }
            );
          }
        }
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
          response.json(`${email} is not a RainSA employee!`);
        } else {
          // employee exists
          let adminEmail = request.admin.email;
          pool.query(
            `SELECT password FROM admin WHERE email=($1)`,
            [adminEmail],
            async (err, res) => {
              if (err) return next(err);

              if (res.rows.length === 0) {
                response.json(`Admin does not exist!`);
              } else {
                let adminPassword = res.rows[0].password;
                let passwordEntered = request.body.password;

                const comparedPassword = await bcrypt.compare(
                  passwordEntered,
                  adminPassword
                );

                if (!comparedPassword) {
                  response.json(`Invalid Password!`);
                } else {
                  pool.query(
                    `DELETE FROM employees WHERE email=($1)`,
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

                      response.json(`${email} has been removed successfully!`);
                    }
                  );
                }
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
          response.json(`Admin does not exist!`);
        } else {
          try {
            const { password } = request.body;
            const hashedPassword = await bcrypt.hash(password, 10);

            if (!password || password === " ") {
              response.json(`Input values missing! Please insert password!`);
            } else {
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

                      Did not request this? Navigate to forgot password and request a password reset ${rainUrl} .
  
                      Thank you and let it Rain!
  
                      Rain Admin
                      `,
                  };

                  // once email is set up you can now send it
                  const info = await transporter.sendMail(updateAdminEmail);

                  response.json(`${email} password updated!`);
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
        response.json(`${email} does not exist!`);
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
              response.json(`Password entered is invalid!`);
            } else {
              // if the passwords match the admin can be deleted
              pool.query(
                `DELETE FROM admin WHERE email=($1)`,
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

                  response.json(`${email} successfully removed from Database!`);
                }
              );
            }
          }
        );
      }
    });
  });

module.exports = router;
