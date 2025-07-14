const { Client } = require("pg");
const { faker } = require("@faker-js/faker"); // Latest import for faker
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
