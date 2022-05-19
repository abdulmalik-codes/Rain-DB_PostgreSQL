// import modules
const { Router } = require("express");
const router = Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../db");
const transporter = require("../db/email");
const jwt_token = require("../SQL/jwt");

// routes and methods
router.all("/", authenticateToken, (request, response, next) => {
  response.header("Authorization", "Bearer");
  next();
});

// authentication parser
function authenticateToken(request, response, next) {
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return response.sendStatus(401);

  jwt.verify(token, jwt_token.ACCESS_TOKEN_SECRET, (err, admin) => {
    if (err) return response.sendStatus(403);
    console.log("yesy yesy");
    request.admin = admin;
    console.log(admin);
    next();
  });
}

router
  .route("/")
  // show all admin users
  .get((request, response, next) => {
    pool.query("SELECT * FROM admin ORDER BY id DESC", (err, res) => {
      if (err) return next(err);

      response.json(res.rows);
    });
  })
  // add admin users
  .post(async (request, response) => {
    try {
      const { email, password } = request.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      pool.query("INSERT INTO admin(email, password) VALUES($1, $2)", [
        email,
        hashedPassword,
      ]);

      response.status(201);
      response.json("Admin added successfully");
    } catch {
      response.status(500).send();
    }

    // response.type("json");
    // response.json();
    // response.redirect("http://localhost:2500/employee");
    // response.send("added");
    // response.send("added admin");
  });

router
  .route("/:email")
  // get admin by email
  .get((request, response) => {
    const { email } = request.params;

    pool.query("SELECT * FROM admin WHERE email=$1", [email], (err, res) => {
      if (err) return next(err);

      response.json(res.rows);
    });
  })
  // edit an admin user
  .put(async (request, response, next) => {
    try {
      const { email } = request.params;
      const { password } = request.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      if (password) {
        pool.query(
          `UPDATE admin SET password=($1) WHERE email=($2)`,
          [hashedPassword, email],
          (err, res) => {
            if (err) return next(err);

            // response.send("admin updated");
            response.json(password + " updated");
          }
        );
      }
    } catch {
      response.status(500).send();
    }
  })
  // delete an admin user
  .delete((request, response, next) => {
    const { email } = request.params;

    pool.query("DELETE FROM admin WHERE email=($1)", [email], (err, res) => {
      if (err) return next(err);

      // response.send(`deleted admin ${email} `);
      response.json();
    });
  });

// verification
checkEmail = (request, response, next) => {};

// employees

router
  .route("/view/employees")
  // view all employees
  .get((request, response, next) => {
    pool.query("SELECT * FROM employees ORDER BY id DESC", (err, res) => {
      if (err) return next(err);

      response.json(res.rows);
    });
  })
  // add employee
  .post(async (request, response, next) => {
    const { name, surname, cell, position, email } = request.body;
    let password = "makeitrain";

    pool.query(
      "INSERT INTO employees(name, surname, cell, position, email, password) VALUES($1, $2, $3, $4, $5, $6)",
      [name, surname, cell, position, email, password],
      (err, res) => {
        if (err) return next(err);
      }
    );

    let welcomeEmail = {
      from: "62545a@gmail.com",
      to: `${email}`,
      subject: `Hello and Welcome to RainSA  ${name}`,
      text: `You have been added to the Rain Employees Database, Login to your account with your email: ${email} and password: ${password}. Please change your password. Link: https://raindbpsql.netlify.app/`,
    };

    const info = await transporter.sendMail(welcomeEmail);
  })
  // delete employees table
  .delete((request, response, next) => {
    pool.query("DROP TABLE employees", (err, res) => {
      if (err) return next(err);

      response.send("Table dropped");
    });
  });

router
  .route("/employee/:email")
  // view employee by email
  .get((request, response, next) => {
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
  .put(async (request, response) => {
    const { email } = request.params;

    // const keys = [
    //   { name: "name" },
    //   { surname: "surname" },
    //   { cell: "cell" },
    //   { position: "position" },
    //   { password: "password" },
    // ];
    const keys = ["name", "surname", "cell", "position", "password"];
    const details = [];

    keys.forEach(async (key) => {
      if (request.body[key]) details.push(key);

      details.forEach((detail) => {
        pool.query(
          `UPDATE employees SET ${detail}=($1) WHERE email=($2)`,
          [request.body[detail], email],
          (err, res) => {
            if (err) return next(err);
          }
        );
      });
    });

    let updatedEmployee = {
      from: "62545a@gmail.com",
      to: `${email}`,
      subject: `${email} updated successfully`,
      text: `Your updated credentials... `,
    };

    const info = await transporter.sendMail(updatedEmployee);
  })
  // delete employee
  .delete(async (request, response, next) => {
    const { email } = request.params;

    pool.query(
      "DELETE FROM employees WHERE email=($1)",
      [email],
      (err, res) => {
        if (err) return next(err);
        response.json();
      }
    );

    let deletedEmployee = {
      from: "62545a@gmail.com",
      to: `${email}`,
      subject: `Goodbye from RainSA  ${email}`,
      text: `You have been removed from the Rain Employees Database`,
    };

    const info = await transporter.sendMail(deletedEmployee);
  });

module.exports = router;
