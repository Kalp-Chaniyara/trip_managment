const { Client } = require("pg");
const { faker } = require("@faker-js/faker"); // Use the latest import for faker

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

// Function to insert dummy data into TRIP table
async function insertTripData() {
  try {
    await client.connect();
    console.log("Connected to the database!");

    const insertSQL = `
            INSERT INTO TRIP (description, duration, price, total_stop)
            VALUES ($1, $2, $3, $4)
        `;

    for (let i = 0; i < 230; i++) {
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
