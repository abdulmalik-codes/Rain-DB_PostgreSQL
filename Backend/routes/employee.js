const { Router } = require("express");
const router = Router();

const bcrypt = require("bcrypt");

const pool = require("../configured");

const transporter = require("../configured/email");

let rainUrl = `https://raindbpsql.netlify.app/`;

// view employee
router
  .route("/")
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

  // edit employee
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

// hod's
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

// single employee
router.route("/employees/:email").get((request, response, next) => {
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

// view department and it's employees
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

module.exports = router;
