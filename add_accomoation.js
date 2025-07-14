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
// Function to insert dummy data into ACCOMMODATION table
async function insertAccommodationData() {
  try {
    await client.connect();
    console.log("Connected to the database!");

    // Step 1: Fetch all trips with their total stops
    const tripResult = await client.query(
      "SELECT trip_id, total_stop FROM TRIP"
    );
    const trips = tripResult.rows;

    // Step 2: Insert accommodation data for random stops
    const insertSQL = `
      INSERT INTO ACCOMMODATION (stop_number, trip_id, address, number_of_days_between_start_and_checkin, duration_of_stay, checkin_time, checkout_time, contact_info)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    for (const trip of trips) {
      const trip_id = trip.trip_id;
      const total_stop = trip.total_stop;

      // Randomly choose a stop number between 1 and total_stop
      const stop_number = Math.floor(Math.random() * total_stop) + 1;

      // Generate random accommodation details
      const address = faker.location.streetAddress(); // Random address
      const number_of_days_between_start_and_checkin = Math.floor(
        Math.random() * 7
      ); // Random days between start and check-in
      const duration_of_stay = Math.floor(Math.random() * 14); // Random stay duration in days

      // Generate random check-in and check-out times (just hours and minutes)
      const checkin_hour = Math.floor(Math.random() * 24); // Random hour
      const checkin_minute = Math.floor(Math.random() * 60); // Random minute
      const checkin_time = `${checkin_hour
        .toString()
        .padStart(2, "0")}:${checkin_minute.toString().padStart(2, "0")}`; // Format to HH:mm

      const checkout_hour = Math.floor(Math.random() * 24); // Random hour
      const checkout_minute = Math.floor(Math.random() * 60); // Random minute
      const checkout_time = `${checkout_hour
        .toString()
        .padStart(2, "0")}:${checkout_minute.toString().padStart(2, "0")}`; // Format to HH:mm

      const contact_info = faker.phone.number({ style: "international" }); // Random contact number

      // Insert into ACCOMMODATION table
      const values = [
        stop_number,
        trip_id,
        address,
        number_of_days_between_start_and_checkin,
        duration_of_stay,
        checkin_time,
        checkout_time,
        contact_info,
      ];

      try {
        await client.query(insertSQL, values);
      } catch (queryError) {
        console.error("Error executing query:", queryError);
      }
    }

    console.log("Inserted accommodation data for trips.");
  } catch (error) {
    console.error("Error inserting accommodation data:", error);
  } finally {
    await client.end();
  }
}

insertAccommodationData();
