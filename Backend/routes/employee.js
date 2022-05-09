const { Router } = require("express");
const router = Router();
const pool = require("../db");

// view employee
router
  .route("/:email")
  .get((request, response) => {
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
  .put((request, response) => {
    const { email } = request.params;
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
            // response.json(res.rows);
          }
        );
      });
    });
  });

module.exports = router;
