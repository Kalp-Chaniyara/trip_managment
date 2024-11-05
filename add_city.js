const { Client } = require("pg");
const { faker } = require("@faker-js/faker"); // Latest import for faker

const client = new Client({
  host: "dpg-csbsmolds78s73bf2930-a.oregon-postgres.render.com",
  port: 5432, // Default PostgreSQL port
  user: "param", // Your username
  password: "Zqy7G7GjZA04bMD7YPv1ARpKV14naBOU", // Your password
  database: "trip_managment", // Your database name
  ssl: {
    rejectUnauthorized: false, // This option allows self-signed certificates. Set it to true in production for security.
  },
});
// Function to insert dummy data into CITY table
async function insertCityData() {
  try {
    await client.connect();
    console.log("Connected to the database!");

    const insertSQL = `
            INSERT INTO CITY (cityname, statename, district_name)
            VALUES ($1, $2, $3)
        `;

    for (let i = 0; i < 300; i++) {
      const values = [
        faker.location.city(), // Random city name
        faker.location.state(), // Random state name
        faker.location.county(), // Random district name
      ];

      try {
        await client.query(insertSQL, values);
      } catch (queryError) {
        console.error("Error executing query:", queryError);
      }
    }
    console.log("Inserted 100 dummy city records.");
  } catch (error) {
    console.error("Error inserting city data:", error);
  } finally {
    await client.end();
  }
}

insertCityData();
