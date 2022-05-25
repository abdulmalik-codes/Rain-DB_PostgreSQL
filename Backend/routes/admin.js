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

                console.log(password);
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
    const { department } = request.body;

    if (!department || department === " ") {
      response.json(`No value inserted`);
    } else {
      // checking if department exists
      pool.query(
        `SELECT * FROM departments WHERE department=($1)`,
        [department],
        (err, res) => {
          if (err) return next(err);

          if (res.rows.length > 0) {
            response.json(`Department already exists`);
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
        const { email, department, admin, promoted } = request.body;

        if (
          !email ||
          !department ||
          !admin ||
          email === " " ||
          department === " " ||
          admin === " "
        ) {
          response.json(`Input values missing!`);
        } else {
          // validationResult takes in the request body as an argument and returns an array of errors
          const errors = validationResult(request);

          // check if there are any errors and if there are return the errors in a json response
          if (!errors.isEmpty()) {
            return response.status(400).json({
              errors: errors.array(),
            });
          }

          // complete hod add, busy here

          // validation passed, now check if email exists
          pool.query(
            `SELECT * FROM employees WHERE email=($1)`,
            [email],
            (err, res) => {
              if (err) return next(err);

              // if there's a response then it means that the email exists
              if (res.rows.length > 0) {
                let accountHolderName = res.rows[0].name;
                let accountHolderDepartment = res.rows[0].department;

                response.json(
                  `${accountHolderName} from ${accountHolderDepartment} already has this email address`
                );
              } else {
                // no response means email is available

                // now we check if the department entered exists
                pool.query(
                  `SELECT * FROM departments WHERE department=($1)`,
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

                            // create a function to add date employee was promoted
                            const d = new Date();
                            let date = d.toLocaleDateString();

                            if (request.admin) {
                              let admin = request.admin.email;

                              console.log(admin);

                              // busy here check if employee exists first then add to db

                              // validation and encryption completed
                              pool.query(
                                `INSERT INTO hod(email, department, admin, promoted) VALUES($1, $2, $3, $4)`,
                                [
                                  email,
                                  department,
                                  "abdul.malik.codes@gmaila.coma",
                                  date,
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
                              response.json(`No authorization`);
                            }
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
          response.json(`Input values missing!`);
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

                response.json(
                  `${employeeName} ${employeeSurname} already has this email address '${employeeEmail}'`
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
                      response.json(`${department} department does not exist`);
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
      `SELECT name, surname, email FROM employees WHERE department=($1)`,
      [departmentName],
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`No employees in this department`);
        } else {
          response.json(res.rows);
        }
      }
    );
  })

  // NOT ABLE TO EDIT OR DELETE TABLES WITH FK CONSTRAINTS
  // edit department
  .put((request, response, next) => {
    const { departmentName } = request.params;
    const { name } = request.body;

    if (!departmentName) {
      response.json(`No departments`);
    } else {
      pool.query(
        `SELECT * FROM departments WHERE department=($1)`,
        [departmentName],
        (err, res) => {
          if (err) return next(err);

          if (res.rows.length === 0) {
            response.json(`No department`);
          } else {
            let oldName = res.rows[0].name;

            pool.query(
              `UPDATE departments SET department=($1) WHERE department=($2)`,
              [name, oldName],
              (err, res) => {
                if (err) return next(err);

                response.json(`Department updated`);
              }
            );

            response.json(res.rows[0].name);
          }
        }
      );
    }
  })

  // delete department
  .delete((request, response, next) => {});

// ******************************************* //

// methods for all /admin/hod/single-hod routes
router
  .route("/hod/:email")

  // view hod by email
  .get((request, response, next) => {
    const { email } = request.params;

    pool.query(`SELECT * FROM hod WHERE email=($1)`, [email], (err, res) => {
      if (err) return next(err);

      if (res.rows.length === 0) {
        response.json(`Hod does not exist`);
      } else {
        response.json(res.rows);
      }
    });
  })

  // edit hod
  .put((request, response, next) => {
    try {
      // getting the email from the path
      const { email } = request.params;

      // can select * here then edit (check if exists)

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
          let updateHodEmail = {
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
          const info = await transporter.sendMail(updateHodEmail);

          response.json(`Hod updated and email sent`);
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

    pool.query(`SELECT * FROM hod WHERE email=($1)`, [email], (err, res) => {
      if (err) return next(err);

      if (res.rows.length === 0) {
        response.json(`Hod does not exist`);
      } else {
        // query to delete hod
        pool.query(
          `DELETE FROM hod WHERE email=($1)`,
          [email],
          async (err, res) => {
            if (err) return next(err);

            let deletedHod = {
              from: "62545a@gmail.com",
              to: `${email}`,
              subject: `Goodbye from RainSA`,
              text: `Hello and Goodbye,
        
        You have been removed from the Rain Hod database
        
        We hope we have parted on good terms and that you'll continue to support RainSA unconditionally
        
        Thank you and good luck with your future endeavors
        
        Rain Admin`,
            };

            // email will be sent
            const info = await transporter.sendMail(deletedHod);

            response.json(`Hod deleted successfully`);
          }
        );
      }
    });
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
          response.json(`Employee not in db`);
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
          response.json(`Employee does not exist`);
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
            response.json("No value added to inputs");
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
                  
                  You recently updated your details on your RainEmployee profile.
                  Here are your updated credentials...
        
                  name: ${name}, surname: ${surname}, cell: ${cell}, position: ${position}, department: ${department} .
        
                  and to request your password you can click on this link: https://raindbpsql.netlify.app/forgot-password .
        
                  Thank you and let it Rain!
        
                  Rain Admin`,
                    };

                    const info = await transporter.sendMail(
                      updatedEmployeeEmail
                    );

                    response.json("Employee details updated");
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
          response.json(`Employee does not exist`);
        } else {
          // employee exists
          let adminEmail = request.admin.email;
          pool.query(
            `SELECT password FROM admin WHERE email=($1)`,
            [adminEmail],
            async (err, res) => {
              if (err) return next(err);

              if (res.rows.length === 0) {
                response.json(`Admin does not exist`);
              } else {
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

                      response.json(`Employee removed from database`);
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
          response.json(`Admin does not exist`);
        } else {
          try {
            const { password } = request.body;
            const hashedPassword = await bcrypt.hash(password, 10);

            if (!password || password === " ") {
              response.json(`No password entered`);
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
