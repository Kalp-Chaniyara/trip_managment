const { Client } = require("pg");
const { faker } = require("@faker-js/faker");
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
// Function to insert dummy data into ROUTESTOP table
async function insertRouteStopData() {
  try {
    await client.connect();
    console.log("Connected to the database!");

    // Step 1: Fetch all trip IDs and their total stops
    const tripResult = await client.query(
      "SELECT trip_id, total_stop FROM TRIP"
    );
    const trips = tripResult.rows;

    if (trips.length === 0) {
      console.log("No trips found. Exiting...");
      return;
    }

    // Step 2: Insert stops for each trip
    const insertSQL = `
      INSERT INTO ROUTESTOP (stop_number, trip_id, city, statename)
      VALUES ($1, $2, $3, $4)
    `;

    for (const trip of trips) {
      const { trip_id, total_stop } = trip;

      for (let stopNumber = 1; stopNumber <= total_stop; stopNumber++) {
        // Step 3: Get a random city and state from the CITY table
        const cityResult = await client.query(
          "SELECT cityname, statename FROM CITY ORDER BY RANDOM() LIMIT 1"
        );

        if (cityResult.rows.length === 0) {
          console.log("No cities found. Exiting...");
          return;
        }

        const { cityname, statename } = cityResult.rows[0];

        // Insert into ROUTESTOP table
        const values = [stopNumber, trip_id, cityname, statename];

        try {
          await client.query(insertSQL, values);
        } catch (queryError) {
          console.error("Error executing query:", queryError);
        }
      }
    }

    console.log("Inserted route stops for all trips.");
  } catch (error) {
    console.error("Error inserting route stop data:", error);
  } finally {
    await client.end();
  }
}

insertRouteStopData();
