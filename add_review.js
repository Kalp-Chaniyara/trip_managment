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

// Function to insert dummy data into REVIEW table
async function insertReviewData() {
  try {
    await client.connect();
    console.log("Connected to the database!");

    // Fetch aadhaar_no from tripUser table for user_id
    const userResult = await client.query('SELECT aadhaar_no FROM tripUser');
    const users = userResult.rows.map(row => row.aadhaar_no);

    // Fetch LEADER_ID and START_TIME_OF_TRIP from TEAM_MANAGEMENT
    const teamManagementResult = await client.query('SELECT LEADER_ID, START_TIME_OF_TRIP FROM TEAM_MANAGEMENT');
    const teamManagement = teamManagementResult.rows;

    // Check if there are enough users and team management records
    if (users.length === 0 || teamManagement.length === 0) {
      console.error('Not enough data in tripUser or TEAM_MANAGEMENT tables to insert into REVIEW.');
      return;
    }

    const insertSQL = `
      INSERT INTO REVIEW (user_id, LEADER_ID, START_TIME_OF_TRIP, rating, comment, review_date)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    // Insert random data into REVIEW table
    for (let i = 0; i < 100; i++) {
      const user_id = users[Math.floor(Math.random() * users.length)]; // Random user ID
      const team = teamManagement[Math.floor(Math.random() * teamManagement.length)]; // Random team management record
      const leader_id = team.leader_id;
      const start_time_of_trip = team.start_time_of_trip;

      const rating = faker.number.int({ min: 0, max: 5 }); // Random rating between 0 and 5
      const comment = "excellent trip";
      const review_date = faker.date.recent(); // Random recent date

      const values = [
        user_id,
        leader_id,
        start_time_of_trip,
        rating,
        comment,
        review_date
      ];

      try {
        await client.query(insertSQL, values);
      } catch (queryError) {
        console.error("Error executing query:", queryError);
      }
    }
    console.log("Inserted 50 dummy review records.");
  } catch (error) {
    console.error("Error inserting review data:", error);
  } finally {
    await client.end();
  }
}

insertReviewData();