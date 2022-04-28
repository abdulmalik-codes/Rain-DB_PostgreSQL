// import modules

// postgres
const { Pool } = require("pg");
// connect to postgres configuration
const { user, host, database, password, port } = require("../SQL/db_config");

// create pool to use postgres
const pool = new Pool({
  user,
  host,
  database,
  password,
  port,
});

// export pool to use in other files
module.exports = pool;
