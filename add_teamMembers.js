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
// Function to insert dummy data into TEAM_MEMBER table
async function insertTeamMemberData() {
  try {
    await client.connect();
    console.log("Connected to the database!");

    // Fetch aadhaar_no from tripUser table for member_id
    const memberResult = await client.query('SELECT aadhaar_no FROM tripUser');
    const members = memberResult.rows.map(row => row.aadhaar_no);

    // Fetch LEADER_ID and START_TIME_OF_TRIP from TEAM_MANAGEMENT
    const teamManagementResult = await client.query('SELECT LEADER_ID, START_TIME_OF_TRIP FROM TEAM_MANAGEMENT');
    const teamManagement = teamManagementResult.rows;

    // Check if there are enough members and team management records
    if (members.length === 0 || teamManagement.length === 0) {
      console.error('Not enough data in tripUser or TEAM_MANAGEMENT tables to insert into TEAM_MEMBER.');
      return;
    }

    const insertSQL = `
      INSERT INTO TEAM_MEMBER (LEADER_ID, START_TIME_OF_TRIP, member_id)
      VALUES ($1, $2, $3)
    `;

    // Insert random data into TEAM_MEMBER table
    for (let i = 0; i < 300; i++) {
      const member_id = members[Math.floor(Math.random() * members.length)]; // Random member ID
      const team = teamManagement[Math.floor(Math.random() * teamManagement.length)]; // Random team management record
      const leader_id = team.leader_id;
      const start_time_of_trip = team.start_time_of_trip;

      const values = [
        leader_id,
        start_time_of_trip,
        member_id
      ];

      try {
        await client.query(insertSQL, values);
      } catch (queryError) {
        console.error("Error executing query:", queryError);
      }
    }
    console.log("Inserted 50 dummy team member records.");
  } catch (error) {
    console.error("Error inserting team member data:", error);
  } finally {
    await client.end();
  }
}

insertTeamMemberData();