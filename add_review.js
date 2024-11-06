const { Client } = require("pg");
const { faker } = require("@faker-js/faker");

// PostgreSQL connection details
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
    for (let i = 0; i < 1000; i++) {
      const user_id = users[Math.floor(Math.random() * users.length)]; // Random user ID
      const team = teamManagement[Math.floor(Math.random() * teamManagement.length)]; // Random team management record
      const leader_id = team.leader_id;
      const start_time_of_trip = team.start_time_of_trip;

      const rating = faker.number.int({ min: 0, max: 5 }); // Random rating between 0 and 5
      const comment = faker.lorem.sentences(); // Random comment
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