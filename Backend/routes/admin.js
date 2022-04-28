// import modules
const { Router } = require("express");
const pool = require("../db");
const router = Router();

// methods
router
  .route("/")
  // show all admin users
  .get((request, response, next) => {
    pool.query("SELECT * FROM admin", (err, res) => {
      if (err) return next(err);

      response.json(res.rows);
    });
  })
  // add admin users
  .post((request, response) => {
    const { email, password } = request.body;
    pool.query("INSERT INTO admin(email, password) VALUES($1, $2)", [
      email,
      password,
    ]);

    response.send("added admin");
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
  .put((request, response, next) => {
    const { email } = request.params;
    const { password } = request.body;

    if (password) {
      pool.query(
        `UPDATE admin SET password=($1) WHERE email=($2)`,
        [password, email],
        (err, res) => {
          if (err) return next(err);

          response.send("admin updated");
        }
      );
    }
  })
  // delete an admin user
  .delete((request, response, next) => {
    const { email } = request.params;

    pool.query("DELETE FROM admin WHERE email=($1)", [email], (err, res) => {
      if (err) return next(err);

      response.send(`deleted admin ${email} `);
    });
  });

// employees

router
  .route("/view/employees")
  // view all employees
  .get((request, response, next) => {
    pool.query("SELECT * FROM employees", (err, res) => {
      if (err) return next(err);

      response.json(res.rows);
    });
  })
  // add employee
  .post((request, response, next) => {
    const { fullname, email, password } = request.body;

    pool.query(
      "INSERT INTO employees(fullname, email, password) VALUES($1, $2, $3)",
      [fullname, email, password],
      (err, res) => {
        if (err) return next(err);

        response.send("Employee Added");
      }
    );
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
  .put((request, response) => {
    const { email } = request.params;

    const keys = ["fullname", "password"];

    const details = [];

    keys.forEach((key) => {
      if (request.body[key]) details.push(key);

      details.forEach((detail) => {
        pool.query(
          `UPDATE employees SET ${detail}=($1) WHERE email=($2)`,
          [request.body[detail], email],
          (err, res) => {
            if (err) return next(err);

            response.send("employee details updated");
          }
        );
      });
    });
  })
  // delete employee
  .delete((request, response, next) => {
    const { email } = request.params;

    pool.query(
      "DELETE FROM employees WHERE email=($1)",
      [email],
      (err, res) => {
        if (err) return next(err);

        response.send("Employee deleted");
      }
    );
  });

router.route("/login").post((request, response, next) => {
  const { email } = request.body;

  let emailArray = [];
  // let emailArray = [email];

  pool.query("SELECT * FROM admin WHERE email=($1)", [email], (err, res) => {
    if (err) return next(err);

    emailArray.push();
    // let contains = emailArray.Contains(email);

    // console.log(emailArray.indexOf(email));

    if (emailArray.length > 0) {
      console.log(emailArray.indexOf(email));

      console.log(res.rows, email, "true");
      response.send("logged in admin");
    } else {
      console.log(emailArray.indexOf(email));

      console.log(res.rows, email, "false");
      response.send("No exists");
    }

    // response.json(res.rows);
  });
});

module.exports = router;

/*

  router.route("/login").post((request, response, next) => {
  const { email } = request.body;
  
  pool.query("SELECT * FROM admin WHERE email=$1", [email], (err, res) => {
    if (err) return next(err);

    response.send("logged in admin");

    // response.json(res.rows);
  });
});


*/

/*



// http://localhost:3000/auth
app.post("/auth", function (request, response) {
  // Capture the input fields
  let username = request.body.username;
  let password = request.body.password;
  // Ensure the input fields exists and are not empty
  if (username && password) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    connection.query(
      "SELECT * FROM accounts WHERE username = ? AND password = ?",
      [username, password],
      function (error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        // If the account exists
        if (results.length > 0) {
          // Authenticate the user
          request.session.loggedin = true;
          request.session.username = username;
          // Redirect to home page
          response.redirect("/home");
        } else {
          response.send("Incorrect Username and/or Password!");
        }
        response.end();
      }
    );
  } else {
    response.send("Please enter Username and Password!");
    response.end();
  }
});



**********************************




pool.query("SELECT * FROM admin WHERE email=$1", [email], (err, res) => {
    if (err) return next(err);

    if (email == "admin@rain.co.za") {
      response.send(`logged in ${email}`);
      // response.redirect("https://abdulmalikcodes.netlify.app/home");
    } else {
      response.send(`User doesnt exist ${email}`);
    }

    // console.log(email);

    // response.send(email, "test");

    // response.json(res.rows);
    // response.redirect("/admin");
  });

******************************************************



  // const { email } = request.body;

  let email = request.body.email;

  if (email == "super.admin@rain.co.za") {
    pool.query("SELECT * FROM admin WHERE email=$1", [email], (err, res) => {
      if (err) {
        return next(err);
      } else {
        if ((res.length = 0)) {
          response.send("hey hey");
        } else {
          console.log(res.rows);
          response.send("NO no");
        }

        response.end();
      }
    });
  } else {
    response.send("please log");
    response.end();
  }


*/
