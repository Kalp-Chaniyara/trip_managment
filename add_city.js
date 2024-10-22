const { Client } = require("pg");
const { faker } = require("@faker-js/faker"); // Latest import for faker

// PostgreSQL connection details
const client = new Client({
  host: "localhost",
  port: 5432,
  user: "postgres", // Update with your username
  password: "KalpPGS2024", // Update with your password
  database: "postgres", // Update with your database name
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

    for (let i = 0; i < 70; i++) {
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
    console.log("Inserted 70 dummy city records.");
  } catch (error) {
    console.error("Error inserting city data:", error);
  } finally {
    await client.end();
  }
}

insertCityData();
