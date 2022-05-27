const { Router } = require("express");
const router = Router();

const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

const pool = require("../configured/index");
const transporter = require("../configured/email");

// ******************************************* //

router
  .route("/")

  .get((request, response, next) => {
    const email = request.hod.email;
    pool.query("SELECT * FROM hod WHERE email=($1)", [email], (err, res) => {
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

  // show all employees
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

  // add employee to hod department
  .post((request, response, next) => {})

  // remove employee from department
  .delete((request, response, next) => {});

// ******************************************* //

// export this file using router variable to use externally
module.exports = router;
