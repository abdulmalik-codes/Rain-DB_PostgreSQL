const { Router } = require("express");
const router = Router();

const bcrypt = require("bcrypt");

const pool = require("../configured");

const transporter = require("../configured/email");

let rainUrl = `https://raindbpsql.netlify.app/`;

// view employee
router
  .route("/")
  // View logged in employee
  .get((request, response, next) => {
    const { email } = request.employee;

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

  // Edit logged in employee
  .put((request, response, next) => {
    try {
      const { email } = request.employee;

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

                      let updatedEmployeeEmail = {
                        from: "62545a@gmail.com",
                        to: `${email}`,
                        subject: `RainSA - Your details updated successfully!`,
                        text: `Hello ${name}, 
                    
                    You recently updated your details on your Rain Employee profile.
                    Here are your updated credentials...
          
                    name: ${name}, surname: ${surname}, cell: ${cell}.
          
                    and to request your password you can click on this link: https://raindbpsql.netlify.app/forgot-password .
          
                    Thank you and let it Rain!
          
                    MyRain`,
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
    } catch {
      response.status(500).send();
    }
  });

// View Hod's
router.route("/view-hod").get((request, response, next) => {
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

// tasks
router.route("/tasks").get((request, response, next) => {
  let employeeEmail = request.employee.email;

  pool.query(
    `SELECT * FROM tasks WHERE assignee=($1)`,
    [employeeEmail],
    (err, res) => {
      if (err) return next(err);

      if (res.rows.length === 0) {
        response.json(`No tasks assigned to ${employeeEmail}`);
      } else {
        response.json(res.rows);
      }
    }
  );
});

// ******************************************* //
router
  .route("/tasks/:name")
  .get((request, response, next) => {
    const employeeEmail = request.employee.email;
    const { name } = request.params;
    pool.query(
      `SELECT * FROM tasks WHERE assignee=($1)`,
      [employeeEmail],
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`No tasks assigned to ${employeeEmail}`);
        } else {
          pool.query(
            `SELECT * FROM tasks WHERE name=($1)`,
            [name],
            (err, res) => {
              if (err) return next(err);

              if (res.rows.length === 0) {
                response.json(`${name} is not a task!`);
              } else {
                let assignee = res.rows[0].assignee;

                if (assignee !== employeeEmail) {
                  response.json(`${name} is not assigned to ${employeeEmail}!`);
                } else {
                  response.json(res.rows);
                }
              }
            }
          );
        }
      }
    );
  })
  // start task
  .put((request, response, next) => {
    const employeeEmail = request.employee.email;
    const { name } = request.params;
    pool.query(
      `SELECT * FROM tasks WHERE assignee=($1)`,
      [employeeEmail],
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`No tasks assigned to ${employeeEmail}`);
        } else {
          pool.query(
            `SELECT * FROM tasks WHERE name=($1)`,
            [name],
            (err, res) => {
              if (err) return next(err);

              if (res.rows.length === 0) {
                response.json(`${name} is not a task!`);
              } else {
                let assignee = res.rows[0].assignee;

                if (assignee !== employeeEmail) {
                  response.json(`${name} is not assigned to ${employeeEmail}!`);
                } else {
                  const keys = ["start_date", "progress", "team_members"];
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
                        `UPDATE tasks SET ${detail}=($1) WHERE name=($2)`,
                        [request.body[detail], name],
                        (err, res) => {
                          if (err) return next(err);

                          response.json(
                            `${name} has been updated by ${employeeEmail}`
                          );
                        }
                      );
                    });
                  }
                }
              }
            }
          );
        }
      }
    );
  });

// ******************************************* //

// View departments (from hod email)
router.route("/view-departments/:email").get((request, response, next) => {
  const { email } = request.params;

  pool.query(`SELECT * FROM hod WHERE email=($1)`, [email], (err, res) => {
    if (err) return next(err);

    if (res.rows.length === 0) {
      response.json(`${email} not a Hod!`);
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

// single employee
router.route("/:email").get((request, response, next) => {
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
});

module.exports = router;
