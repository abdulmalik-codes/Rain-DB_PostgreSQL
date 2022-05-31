const { Router } = require("express");
const router = Router();

const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

const pool = require("../configured/index");
const transporter = require("../configured/email");

// global variables
let rainUrl = `https://raindbpsql.netlify.app/`;

// ******************************************* //

router
  .route("/")
  // logged in hod
  .get((request, response, next) => {
    const email = request.hod.email;
    pool.query(`SELECT * FROM hod WHERE email=($1)`, [email], (err, res) => {
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
  })

  // edit hod
  .put((request, response, next) => {
    try {
      // getting the email from the path
      const email = request.hod.email;
      // let { name, surname, cell, password } = request.body;

      pool.query(`SELECT * FROM hod WHERE email=($1)`, [email], (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`${email} has not been assigned as Hod!`);
        } else {
          pool.query(
            `SELECT * FROM employees WHERE email=($1)`,
            [email],
            (err, res) => {
              if (err) return next(err);

              if (res.rows.length === 0) {
                response.json(`${email} is not a RainSA employee!`);
              } else {
                const keys = ["name", "surname", "cell", "password"];
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

                      password = res.rows[0].password;
                      const hashedPassword = await bcrypt.hash(password, 10);

                      pool.query(
                        `UPDATE employees SET password=($1) WHERE email=($2)`,
                        [hashedPassword, email],
                        async (err, res) => {
                          if (err) return next(err);

                          let updatedHodEmail = {
                            from: "62545a@gmail.com",
                            to: `${email}`,
                            subject: `RainSA - Your details updated successfully!`,
                            text: `Hello ${name}, 
                        
                        You recently updated your details on your Rain Employee profile.
                        Here are your updated credentials...
              
                        name: ${name}, surname: ${surname}, cell: ${cell}.
              
                        and to request your password you can click on this link: https://raindbpsql.netlify.app/forgot-password .
              
                        Thank you and let it Rain!
              
                        Rain Admin`,
                          };

                          const info = await transporter.sendMail(
                            updatedHodEmail
                          );

                          response.json(
                            `${email}'s details updated successfully!`
                          );
                        }
                      );
                    }
                  );
                }
              }
            }
          );
        }
      });
    } catch {
      response.status(500).send();
    }
  });

// ******************************************* //

// methods for all /hod/employees routes
router
  .route("/employees")

  // show all employees in hod's department
  .get((request, response, next) => {
    const hodEmail = request.hod.email;

    pool.query(
      `SELECT department FROM hod WHERE email=($1)`,
      [hodEmail],
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`${hodEmail} is not assigned as Hod!`);
        } else {
          const department = res.rows[0].department;

          pool.query(
            `SELECT * FROM employees WHERE department=($1)`,
            [department],
            (err, res) => {
              if (err) return next(err);

              if (res.rows.length === 0) {
                response.json(`No response!`);
              } else {
                response.json(res.rows);
              }
            }
          );
        }
      }
    );
  })

  // add employee to hod department to hod's department
  .post(
    [check("email", "Please enter a valid email!").isEmail()],
    (request, response, next) => {
      try {
        const { name, surname, cell, position, email } = request.body;

        if (
          !name ||
          !surname ||
          !cell ||
          !position ||
          !email ||
          name === " " ||
          surname === " " ||
          cell === " " ||
          position === " " ||
          email === " "
        ) {
          response.json(
            `Input values missing! Please make sure to fill in all required fields!`
          );
        } else {
          const errors = validationResult(request);

          if (!errors.isEmpty()) {
            return response.status(400).json({
              errors: errors.array(),
            });
          }

          pool.query(
            `SELECT * FROM employees WHERE email=($1)`,
            [email],
            async (err, res) => {
              if (err) return next(err);

              if (res.rows.length > 0) {
                let employeeEmail = res.rows[0].email;
                let employeeName = res.rows[0].name;
                let employeeSurname = res.rows[0].surname;
                let employeeDepartment = res.rows[0].department;

                response.json(
                  `${employeeName} ${employeeSurname} from ${employeeDepartment}, already has this email address: ${employeeEmail} !`
                );
              } else {
                pool.query(
                  `SELECT * FROM hod WHERE email=($1)`,
                  [request.hod.email],
                  async (err, res) => {
                    if (err) return next(err);

                    if (res.rows.length === 0) {
                      response.json(`No response`);
                    } else {
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

                      let password = randomPassword();
                      const hashedPassword = await bcrypt.hash(password, 10);

                      const d = new Date();
                      let date = d.toLocaleDateString();

                      let department = res.rows[0].department;
                      let hodEmail = res.rows[0].email;

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
                            subject: `Welcome to RainSA's ${department} department`,
                            text: `Hello ${name},                                
    
                        You have been successfully added to the Rain Employees database in the ${department} department.
                                                      
                        Log into your account with your email: '${email}' and password: '${password}'.
                                                      
                        NB! MAKE SURE TO CHANGE YOUR PASSWORD!!!
                                                      
                        link: ${rainUrl}
                                                      
                        Thank you and let it Rain!
                                                      
                        ${hodEmail}
                        Rain Head of ${department}                      

                        `,
                          };

                          // once email is set up, it gets sent
                          const info = await transporter.sendMail(
                            welcomeEmployeeEmail
                          );

                          response
                            .status(201)
                            .json(`${department} employee added successfully`);
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

router.route("/tasks-hod").get((request, response, next) => {
  let hodEmail = request.hod.email;
  pool.query(
    `SELECT * FROM tasks WHERE assignee=($1)`,
    [hodEmail],
    (err, res) => {
      if (err) return next(err);

      if (res.rows.length === 0) {
        response.json(`No tasks assigned to ${hodEmail}`);
      } else {
        response.json(res.rows);
      }
    }
  );
});

// ******************************************* //

router
  .route("/tasks-employees")
  .get((request, response, next) => {
    pool.query(
      `SELECT * FROM tasks WHERE project_manager=($1)`,
      [request.hod.email],
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`No Tasks in the hod database!`);
        } else {
          response.json(res.rows);
        }
      }
    );
  })
  .post((request, response, next) => {
    try {
      const {
        name,
        description,
        assignee,
        start_date,
        due_date,
        progress,
        team_members,
      } = request.body;

      if (!name || name === " " || !description || description === " ") {
        response.json(
          `Input values missing! Please provide an email to add an Admin!`
        );
      } else {
        if (assignee) {
          pool.query(
            `SELECT * FROM employees WHERE email=($1)`,
            [assignee],
            (err, res) => {
              if (err) return next(err);

              let employeeDepartment = res.rows[0].department;
              let hodEmail = request.hod.email;
              pool.query(
                `SELECT * FROM hod WHERE email=($1)`,
                [hodEmail],
                (err, res) => {
                  if (err) return next(err);

                  if (res.rows.length === 0) {
                    response.json(`No Hod`);
                  } else {
                    let hodDepartment = res.rows[0].department;

                    if (employeeDepartment !== hodDepartment) {
                      response.json(
                        `${assignee} is not part of ${hodDepartment}`
                      );
                    }
                  }
                }
              );
            }
          );
        }

        const adminEmail = request.admin.email;
        pool.query(
          `SELECT * FROM admin WHERE email=($1)`,
          [adminEmail],
          (err, res) => {
            if (err) return next(err);

            if (res.rows.length === 0) {
              response.json(`No admin!`);
            } else {
              pool.query(
                `INSERT INTO tasks(name, description, assignee, start_date, due_date, progress, team_members, project_manager) 
                  VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                  name,
                  description,
                  assignee,
                  start_date,
                  due_date,
                  progress,
                  team_members,
                  adminEmail,
                ],
                (err, res) => {
                  if (err) return next(err);

                  response.json(`task has been given!`);
                }
              );
            }
          }
        );
      }
    } catch {
      response.status(500).send();
    }
  });

// ******************************************* //

router
  // view all the hod's in the database
  .route("/view-hod")

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

router
  .route("/employees/:email")
  .get((request, response, next) => {
    const { email } = request.params;

    pool.query(
      `SELECT * FROM employees WHERE email=($1)`,
      [email],
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`${email} not a RainSA employee!`);
        } else {
          response.json(res.rows);
        }
      }
    );
  })
  // should only edit own employees, get from delete
  .put((request, response, next) => {
    const hodEmail = request.hod.email;
    const { email } = request.params;

    if (!hodEmail) {
      response.json(`None`);
    } else {
      pool.query(
        `SELECT department FROM hod WHERE email=($1)`,
        [hodEmail],
        (err, res) => {
          if (err) return next(err);

          if (res.rows.length === 0) {
            response.json(`${hodEmail} is not assigned as Hod!`);
          } else {
            const department = res.rows[0].department;
            const departmentHod = res.rows[0].department;

            pool.query(
              `SELECT * FROM employees WHERE department=($1)`,
              [department],
              (err, res) => {
                if (err) return next(err);

                if (res.rows.length === 0) {
                  response.json(`No response!`);
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

                        if (res.rows.length === 0) {
                          response.json(`No response!`);
                        } else {
                          name = res.rows[0].name;
                          surname = res.rows[0].surname;
                          cell = res.rows[0].cell;
                          position = res.rows[0].position;
                          employeeDepartment = res.rows[0].department;

                          password = res.rows[0].password;
                          const hashedPassword = await bcrypt.hash(
                            password,
                            10
                          );

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
                          
                            Your details on your Rain Employee profile was recently updated by the Head of ${departmentHod}.
                            Here are your updated credentials...
                              
                            name: ${name}, surname: ${surname}, cell: ${cell}, position: ${position}, department: ${employeeDepartment} .
                              
                            and to request your password you can click on this link: https://raindbpsql.netlify.app/forgot-password .
                              
                            Thank you and let it Rain!
                              
                            Head of ${departmentHod}`,
                              };

                              const info = await transporter.sendMail(
                                updatedEmployeeEmail
                              );

                              response.json(
                                `${email}'s details updated successfully!`
                              );
                            }
                          );
                        }
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
  })
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
          let employeeDepartment = res.rows[0].department;
          let hodEmail = request.hod.email;

          pool.query(
            `SELECT department from employees WHERE email=($1)`,
            [hodEmail],
            (err, res) => {
              if (err) return next(err);

              if (res.rows.length === 0) {
                response.json(`No response!`);
              } else {
                hodDepartment = res.rows[0].department;

                if (employeeDepartment !== hodDepartment) {
                  response.json(
                    `Head of ${hodDepartment} cannot remove employee from ${employeeDepartment}`
                  );
                } else {
                  pool.query(
                    `SELECT password FROM employees WHERE email=($1)`,
                    [hodEmail],
                    async (err, res) => {
                      if (err) return next(err);

                      if (res.rows.length === 0) {
                        response.json(`Hod does not exist!`);
                      } else {
                        if (request.body.password) {
                          let hodPassword = res.rows[0].password;
                          let passwordEntered = request.body.password;

                          const comparedPassword = await bcrypt.compare(
                            passwordEntered,
                            hodPassword
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

                                const info = await transporter.sendMail(
                                  deletedEmployee
                                );

                                response.json(
                                  `${email} has been removed successfully!`
                                );
                              }
                            );
                          }
                        } else {
                          response.json(`No password Entered!`);
                        }
                      }
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

// selects hod from 'view-hod' and shows all employees in that department
router.route("/:email").get((request, response, next) => {
  const { email } = request.params;

  pool.query(`SELECT * FROM hod WHERE email=($1)`, [email], (err, res) => {
    if (err) return next(err);

    if (res.rows.length === 0) {
      response.json(`No Hod!`);
    } else {
      hodDepartment = res.rows[0].department;

      pool.query(
        `SELECT * FROM employees WHERE department=($1)`,
        [hodDepartment],
        (err, res) => {
          if (err) return next(err);

          if (res.rows.length === 0) {
            response.json(`No Department!`);
          } else {
            response.json(res.rows);
          }
        }
      );
    }
  });
});

// ******************************************* //
module.exports = router;
