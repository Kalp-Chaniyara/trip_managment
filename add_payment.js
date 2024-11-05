const { Client } = require("pg");
const { faker } = require("@faker-js/faker");

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

// Function to insert dummy data into PAYMENT table
async function insertPaymentData() {
  try {
    await client.connect();
    console.log("Connected to the database!");

    // Fetch LEADER_ID and START_TIME_OF_TRIP from TEAM_MANAGEMENT
    const teamManagementResult = await client.query('SELECT LEADER_ID, START_TIME_OF_TRIP FROM TEAM_MANAGEMENT');
    const teamManagement = teamManagementResult.rows;

    // Check if there is enough data in TEAM_MANAGEMENT
    if (teamManagement.length === 0) {
      console.error('Not enough data in TEAM_MANAGEMENT table to insert into PAYMENT.');
      return;
    }

    const insertSQL = `
      INSERT INTO PAYMENT (LEADER_ID, START_TIME_OF_TRIP, payment_method, payment_date, amount_paid)
      VALUES ($1, $2, $3, $4, $5)
    `;

    // Payment methods to choose from
    const paymentMethods = ["Credit Card", "Debit Card", "PayPal", "Bank Transfer", "Cash", "Cryptocurrency"];

    // Insert random data into PAYMENT table
    for (let i = 0; i < 50; i++) {
      const team = teamManagement[Math.floor(Math.random() * teamManagement.length)]; // Random team management record
      const leader_id = team.leader_id;
      const start_time_of_trip = team.start_time_of_trip;

      const payment_method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]; // Random payment method
      const payment_date = faker.date.recent(); // Random recent date
      const amount_paid = parseFloat(faker.number.float({ min: 100.0, max: 5000.0 }).toFixed(2)); // Random amount paid between 100 and 5000

      const values = [
        leader_id,
        start_time_of_trip,
        payment_method,
        payment_date,
        amount_paid
      ];

      try {
        await client.query(insertSQL, values);
      } catch (queryError) {
        console.error("Error executing query:", queryError);
      }
    }
    console.log("Inserted 50 dummy payment records.");
  } catch (error) {
    console.error("Error inserting payment data:", error);
  } finally {
    await client.end();
  }
}

insertPaymentData();