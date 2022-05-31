const { Router } = require("express");
const router = Router();

const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

const pool = require("../configured/index");
const transporter = require("../configured/email");

const accessTokens = require("../secrets/authToken");

router.route("/hod-tasks").get((request, response, next) => {
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

router
  .route("/hod")
  .get((request, response, next) => {
    let hodEmail = request.hod.email;

    pool.query(
      `SELECT * FROM tasks WHERE project_manager=($1)`,
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
  })
  .post((request, response, next) => {});

router
  .route("/:assignee")
  .get((request, response, next) => {
    const { assignee } = request.params;

    pool.query(
      `SELECT * FROM tasks WHERE assignee=($1)`,
      [assignee],
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`No response!`);
        } else {
          response.json(res.rows);
        }
      }
    );
  })
  .put((request, response, next) => {})
  .delete((request, response, next) => {});

router
  .route("/hod/:project_manager")
  .get((request, response, next) => {
    const { project_manager } = request.params;

    pool.query(
      `SELECT * FROM tasks WHERE project_manager=($1)`,
      [project_manager],
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`No response!`);
        } else {
          response.json(res.rows);
        }
      }
    );
  })
  .put((request, response, next) => {})
  .delete((request, response, next) => {});

router
  .route("/employee/:assignee")
  .get((request, response, next) => {
    const { assignee } = request.params;

    pool.query(
      `SELECT * FROM tasks WHERE assignee=($1)`,
      [assignee],
      (err, res) => {
        if (err) return next(err);

        if (res.rows.length === 0) {
          response.json(`No response!`);
        } else {
          response.json(res.rows);
        }
      }
    );
  })
  .put((request, response, next) => {})
  .delete((request, response, next) => {});

module.exports = router;
