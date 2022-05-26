const { Router } = require("express");
const router = Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwt_token = require("../secrets/jwt");

const pool = require("../configured/index");

// login and authentication
router
  .route("/admin") //log

  // login admin
  .post((request, response, next) => {
    const { email, password } = request.body;

    pool.query(
      "SELECT * FROM admin WHERE email=($1)",
      [email],
      async (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`Admin does not exist!`);
        } else {
          //   authenticate
          const admin = { email: email };
          let adminPassword = res.rows[0].password;
          if (await bcrypt.compare(password, adminPassword)) {
            // authentication passed
            // jwt

            const accessToken = generateAdminAccessToken(admin);
            const refreshToken = jwt.sign(
              admin,
              jwt_token.REFRESH_TOKEN_SECRET
            );
            refreshTokens.push(refreshToken);

            response.json({
              accessToken: accessToken,
              refreshToken: refreshToken,
            });
          } else {
            response.json(`Invalid Password!`);
          }
        }
      }
    );
  })

  // delete token
  .delete((request, response) => {
    refreshTokens = refreshTokens.filter(
      (token) => token !== request.body.token
    );
    response.sendStatus(204);
  });

// **********************************************************

router
  .route("/hod")

  // login hod
  .post((request, response, next) => {
    const { email, password } = request.body;

    pool.query(`SELECT * FROM hod WHERE email=($1)`, [email], (err, res) => {
      if (err) return next(err);

      if (res.rows.length === 0) {
        response.json(`${email} is not assigned to any department!`);
      } else {
        pool.query(
          `SELECT * FROM employees WHERE email=($1)`,
          [email],
          async (err, res) => {
            if (err) return next(err);

            //   authenticate
            const hod = { email: email };
            let hodPassword = res.rows[0].password;
            let passwordMatch = await bcrypt.compare(password, hodPassword);

            if (passwordMatch) {
              const accessToken = generateHodAccessToken(hod);
              const refreshToken = jwt.sign(hod, jwt_token.HOD_REFRESH_TOKEN);
              refreshTokens.push(refreshToken);

              response.json({
                accessToken: accessToken,
                refreshToken: refreshToken,
              });
            } else {
              response.json(`Incorrect Password!`);
            }
          }
        );
      }
    });
  })

  // delete token
  .delete((request, response) => {
    refreshTokens = refreshTokens.filter(
      (token) => token !== request.body.token
    );
    response.sendStatus(204);
  });

// **********************************************************

router
  .route("/employee")

  // login employee
  .post((request, response, next) => {
    const { email, password } = request.body;

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

              if (res.rows.length > 0) {
                response.json(
                  `${email} cannot log in as an Employee! Log in as Hod!`
                );
              } else {
                //   authenticate

                pool.query(
                  `SELECT * FROM employees WHERE email=($1)`,
                  [email],
                  async (err, res) => {
                    if (err) return next(err);

                    const employee = { email: email };
                    let employeePassword = res.rows[0].password;
                    let passwordMatch = await bcrypt.compare(
                      password,
                      employeePassword
                    );

                    if (passwordMatch) {
                      const accessToken = generateEmployeeAccessToken(employee);
                      const refreshToken = jwt.sign(
                        employee,
                        jwt_token.EMPLOYEE_REFRESH_TOKEN
                      );
                      refreshTokens.push(refreshToken);

                      response.json(accessToken);
                    } else {
                      response.json(`Incorrect Password!`);
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  })

  // delete token
  .delete((request, response) => {
    refreshTokens = refreshTokens.filter(
      (token) => token !== request.body.token
    );
    response.sendStatus(204);
  });

// **********************************************************

// refresh token
let refreshTokens = [];

// tokens
router.route("/admin-token").post((request, response) => {
  const refreshToken = request.body.token;
  if (refreshToken == null) return response.sendStatus(401);

  if (!refreshTokens.includes(refreshToken)) return response.sendStatus(403);
  jwt.verify(refreshToken, jwt_token.REFRESH_TOKEN_SECRET, (err, admin) => {
    if (err) return response.sendStatus(403);
    const accessToken = generateAdminAccessToken({ email: admin.email });
    response.json({ accessToken: accessToken });
  });
});

router.route("/hod-token").post((request, response) => {
  const refreshToken = request.body.token;
  if (refreshToken == null) return response.sendStatus(401);

  if (!refreshTokens.includes(refreshToken)) return response.sendStatus(403);
  jwt.verify(refreshToken, jwt_token.HOD_REFRESH_TOKEN, (err, hod) => {
    if (err) return response.sendStatus(403);
    const accessToken = generateHodAccessToken({ email: hod.email });
    response.json({ accessToken: accessToken });
  });
});

router.route("/employee-token").post((request, response) => {
  const refreshToken = request.body.token;
  if (refreshToken == null) return response.sendStatus(401);

  if (!refreshTokens.includes(refreshToken)) return response.sendStatus(403);
  jwt.verify(
    refreshToken,
    jwt_token.EMPLOYEE_REFRESH_TOKEN,
    (err, employee) => {
      if (err) return response.sendStatus(403);
      const accessToken = generateEmployeeAccessToken({
        email: employee.email,
      });
      response.json({ accessToken: accessToken });
    }
  );
});

// generate tokens
function generateAdminAccessToken(admin) {
  return jwt.sign(admin, jwt_token.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
}
function generateHodAccessToken(hod) {
  return jwt.sign(hod, jwt_token.HOD_TOKEN_SECRET, { expiresIn: "1d" });
}
function generateEmployeeAccessToken(employee) {
  return jwt.sign(employee, jwt_token.EMPLOYEE_TOKEN_SECRET, {
    expiresIn: "1d",
  });
}

module.exports = router;
