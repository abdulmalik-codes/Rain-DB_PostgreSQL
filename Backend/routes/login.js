const { Router } = require("express");
const router = Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwt_token = require("../secrets/jwt");

const pool = require("../configured/index");

// admin login and authentication
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
          console.log("no email exists");
        } else {
          //   authenticate
          const admin = { email: email };
          let adminPassword = res.rows[0].password;
          if (await bcrypt.compare(password, adminPassword)) {
            // authentication passed
            // jwt

            const accessToken = generateAccessToken(admin);
            const refreshToken = jwt.sign(
              admin,
              jwt_token.REFRESH_TOKEN_SECRET
            );
            refreshTokens.push(refreshToken);
            // response.json({
            //   accessToken: accessToken,
            //   refreshToken: refreshToken,
            // });

            response.json(accessToken);
            console.log(accessToken);
          } else {
            console.log("not allowed");
            response.json("Admin Does not Exist");
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
  })
  .get((request, response, next) => {
    pool.query(
      "SELECT * FROM admin WHERE email=($1)",
      [request.admin.email],
      (err, res) => {
        if (err) return next(err);

        response.json(res.rows);
      }
    );
  });

// refresh token
let refreshTokens = [];
// token
router.route("/token").post((request, response) => {
  const refreshToken = request.body.token;
  if (refreshToken == null) return response.sendStatus(401);

  if (!refreshTokens.includes(refreshToken)) return response.sendStatus(403);
  jwt.verify(refreshToken, jwt_token.REFRESH_TOKEN_SECRET, (err, admin) => {
    if (err) return response.sendStatus(403);
    const accessToken = generateAccessToken({ email: admin.email });
    response.json({ accessToken: accessToken });
  });
});

// generate token
function generateAccessToken(admin) {
  return jwt.sign(admin, jwt_token.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
}

module.exports = router;
