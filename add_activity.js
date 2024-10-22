const { Client } = require("pg");
const { faker } = require("@faker-js/faker");

// PostgreSQL connection details
const client = new Client({
  host: "localhost",
  port: 5432,
  user: "postgres", // Update with your username
  password: "param", // Update with your password
  database: "trip", // Update with your database name
});

// Function to insert dummy data into ACTIVITY table
async function insertActivityData() {
  try {
    await client.connect();
    console.log("Connected to the database!");

    // Step 1: Fetch all trip IDs
    const tripResult = await client.query("SELECT trip_id FROM TRIP");
    const trips = tripResult.rows;

    if (trips.length === 0) {
      console.log("No trips found. Exiting...");
      return;
    }

    // Step 2: Fetch all stops for each trip
    const stopResult = await client.query(
      "SELECT trip_id, stop_number FROM ROUTESTOP"
    );
    const stops = stopResult.rows;

    // Step 3: Insert activities for each stop
    const insertSQL = `
      INSERT INTO ACTIVITY (stop_number, trip_id, duration, name, description)
      VALUES ($1, $2, $3, $4, $5)
    `;

    for (const trip of trips) {
      const trip_id = trip.trip_id;

      // Get stops for the current trip
      const tripStops = stops.filter((stop) => stop.trip_id === trip_id);

      for (const stop of tripStops) {
        const { stop_number } = stop;

        // Random duration between 30 and 240 minutes
        const duration = Math.floor(Math.random() * 210) + 30;
        const name = faker.lorem.words(); // Random activity name
        const description = faker.lorem.sentence(); // Random description

        // Insert into ACTIVITY table
        const values = [stop_number, trip_id, duration, name, description];

        try {
          await client.query(insertSQL, values);
        } catch (queryError) {
          console.error("Error executing query:", queryError);
        }
      }
    }

    console.log("Inserted activities for all trips.");
  } catch (error) {
    console.error("Error inserting activity data:", error);
  } finally {
    await client.end();
  }
}

insertActivityData();
