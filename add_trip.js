const { Client } = require("pg");
const { faker } = require("@faker-js/faker"); // Use the latest import for faker

// PostgreSQL connection details
const client = new Client({
  host: "localhost",
  port: 5432,
  user: "postgres", // Update with your username
  password: "KalpPGS2024", // Update with your password
  database: "postgres", // Update with your database name
});

// Function to insert dummy data into TRIP table
async function insertTripData() {
  try {
    await client.connect();
    console.log("Connected to the database!");

    const insertSQL = `
            INSERT INTO TRIP (description, duration, price, total_stop)
            VALUES ($1, $2, $3, $4)
        `;

    for (let i = 0; i < 70; i++) {
      const values = [
        faker.lorem.sentence(), // Random description
        faker.number.int({ min: 1, max: 30 }), // Random duration between 1 and 30 days
        parseFloat(faker.number.float({ min: 100.0, max: 1000.0 }).toFixed(2)), // Random price between 100.00 and 1000.00
        faker.number.int({ min: 1, max: 10 }), // Random total stops between 1 and 10
      ];

      try {
        await client.query(insertSQL, values);
      } catch (queryError) {
        console.error("Error executing query:", queryError);
      }
    }
    console.log("Inserted 70 dummy trip records.");
  } catch (error) {
    console.error("Error inserting trip data:", error);
  } finally {
    await client.end();
  }
}

insertTripData();
