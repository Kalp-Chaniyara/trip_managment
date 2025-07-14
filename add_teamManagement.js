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
// Function to insert dummy data into TEAM_MANAGEMENT table
async function insertTeamManagementData() {
  try {
    await client.connect();
    console.log("Connected to the database!");

    // Fetch aadhaar_no from tripUser table for LEADER_ID
    const leaderResult = await client.query('SELECT aadhaar_no FROM tripUser');
    const leaders = leaderResult.rows.map(row => row.aadhaar_no);

    // Fetch trip_id from TRIP table for TRIP_ID
    const tripResult = await client.query('SELECT trip_id FROM TRIP');
    const trips = tripResult.rows.map(row => row.trip_id);

    // Check if we have enough leaders and trips to assign
    if (leaders.length === 0 || trips.length === 0) {
      console.error('Not enough data in tripUser or TRIP tables to insert into TEAM_MANAGEMENT.');
      return;
    }

    const insertSQL = `
            INSERT INTO TEAM_MANAGEMENT (LEADER_ID, START_TIME_OF_TRIP, TRIP_ID)
            VALUES ($1, $2, $3)
        `;

    // Insert random data into TEAM_MANAGEMENT table
    for (let i = 0; i < 300; i++) {
      const leader_id = leaders[Math.floor(Math.random() * leaders.length)]; // Random leader ID
      const trip_id = trips[Math.floor(Math.random() * trips.length)]; // Random trip ID
      const start_time_of_trip = faker.date.past(); // Random start time of trip

      const values = [
        leader_id,
        start_time_of_trip,
        trip_id
      ];

      try {
        await client.query(insertSQL, values);
      } catch (queryError) {
        console.error("Error executing query:", queryError);
      }
    }
    console.log("Inserted 50 dummy team management records.");
  } catch (error) {
    console.error("Error inserting team management data:", error);
  } finally {
    await client.end();
  }
}

insertTeamManagementData();