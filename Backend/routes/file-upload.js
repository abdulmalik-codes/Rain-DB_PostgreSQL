const { Router, request } = require("express");
const router = Router();

const pool = require("../configured/index");

router
  .route("/upload-avatar")
  .get(async (request, response, next) => {
    await pool.query(`SELECT * FROM images`, (err, res) => {
      if (err) return next(err);
      console.log(res.rows[0]);
      response.end(res.rows[0].image);
    });
  })

  .post(async (req, res, next) => {
    const { name, data } = req.files.avatar;

    pool.query(
      `INSERT INTO images(name, image) VALUES($1, $2)`,
      [name, data],
      (err, res) => {
        if (err) return next(err);
      }
    );
    res.sendStatus(200);
  });

router.route("/upload-avatar/:id").get(async (request, response, next) => {
  const { id } = request.params;

  pool.query(`SELECT * FROM images WHERE id=($1)`, [id], (err, res) => {
    if (err) return next(err);

    if (res.rows.length === 0) {
      response.json(`No image`);
    } else {
      response.end(res.rows[0].profile_picture);
    }
  });
});

module.exports = router;
