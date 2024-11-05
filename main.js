const { Client } = require("pg");

// PostgreSQL connection details
const client = new Client({
  host: "localhost",
  port: 5432,
  user: "postgres", // Update with your username
  password: "param", // Update with your password
  database: "trip", // Update with your database name
});
