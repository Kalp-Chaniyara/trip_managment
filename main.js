const { Client } = require("pg");
const readline = require("readline");

const client = new Client({
  host: "dpg-csbsmolds78s73bf2930-a.oregon-postgres.render.com",
  port: 5432,
  user: "param",
  password: "Zqy7G7GjZA04bMD7YPv1ARpKV14naBOU",
  database: "trip_managment",
  ssl: {
    rejectUnauthorized: false,
  },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  try {
    await client.connect();
    console.log("Connected to the database.");

    while (true) {
      console.log("\nMenu:");
      console.log("1. Get Trip ID for a Member");
      console.log("2. Get City by Trip ID");
      console.log("3. Get Ratings and Comments");
      console.log("4. Get Total Price for a Trip");
      console.log("5. Find Trips within a Date Range");
      console.log("6. Retrieve User Details with Bookings");
      console.log("7. List Accommodations for a Specific Trip");
      console.log("0. Exit");

      const choice = await askQuestion("Select an option: ");

      switch (choice) {
        case "1":
          await getTripIDForMember();
          break;
        case "2":
          await getCityByTripID();
          break;
        case "3":
          await getRatingsAndComments();
          break;
        case "4":
          await getTotalPriceForTrip();
          break;
        case "5":
          await findTripsWithinDateRange();
          break;
        case "6":
          await retrieveUserDetailsWithBookings();
          break;
        case "7":
          await listAccommodationsForTrip();
          break;
        case "0":
          console.log("Exiting...");
          await client.end();
          return;
        default:
          console.log("Invalid option. Please try again.");
      }
    }
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

async function getTripIDForMember() {
  const memberId = await askQuestion("Enter Member ID: ");
  const result = await client.query(
    `SELECT mt.trip_id
     FROM TEAM_MEMBER AS m
     JOIN TEAM_MANAGEMENT AS mt ON m.LEADER_ID = mt.LEADER_ID
     AND m.START_TIME_OF_TRIP = mt.START_TIME_OF_TRIP
     WHERE m.member_id = $1`,
    [memberId]
  );
  console.log("Trip IDs for Member:", result.rows);
}

// Add similar functions for the remaining queries
async function getCityByTripID() {
  const tripId = await askQuestion("Enter Trip ID: ");
  const result = await client.query(
    `SELECT city
     FROM routestop
     WHERE trip_id = $1`,
    [tripId]
  );
  console.log("Cities for Trip ID:", result.rows);
}

async function getRatingsAndComments() {
  const tripId = await askQuestion("Enter Trip ID: ");
  const result = await client.query(
    `SELECT rating, comment
     FROM review
     WHERE concat(LEADER_ID, START_TIME_OF_TRIP) IN (
         SELECT concat(LEADER_ID, START_TIME_OF_TRIP)
         FROM TEAM_MANAGEMENT
         WHERE trip_id = $1
     )`,
    [tripId]
  );
  console.log("Ratings and Comments:", result.rows);
}

async function getTotalPriceForTrip() {
  const tripId = await askQuestion("Enter Trip ID: ");
  const result = await client.query(
    `SELECT sum(memcount) * (SELECT price FROM trip WHERE trip_id = $1) AS total
     FROM (
         SELECT count(member_id) AS memcount
         FROM team_member
         WHERE concat(LEADER_ID, START_TIME_OF_TRIP) IN (
             SELECT concat(LEADER_ID, START_TIME_OF_TRIP)
             FROM TEAM_MANAGEMENT
             WHERE trip_id = $1
         )
     ) AS f`,
    [tripId]
  );
  console.log("Total Price:", result.rows);
}

async function findTripsWithinDateRange() {
  const startDate = await askQuestion("Enter Start Date (YYYY-MM-DD): ");
  const endDate = await askQuestion("Enter End Date (YYYY-MM-DD): ");
  const result = await client.query(
    `SELECT T.trip_id, T.description, T.duration, T.price, T.total_stop
     FROM TEAM_MANAGEMENT TM
     JOIN TRIP T ON TM.TRIP_ID = T.trip_id
     WHERE TM.START_TIME_OF_TRIP BETWEEN $1 AND $2`,
    [startDate, endDate]
  );
  console.log("Trips within date range:", result.rows);
}

async function retrieveUserDetailsWithBookings() {
  const aadhaarNo = await askQuestion("Enter Aadhaar Number: ");
  const result = await client.query(
    `SELECT U.aadhaar_no, U.first_name, U.middle_name, U.last_name, U.phone_no, U.email, 
            TM.TRIP_ID, T.description, T.duration, T.price
     FROM tripUser U
     JOIN TEAM_MANAGEMENT TM ON U.aadhaar_no = TM.LEADER_ID
     JOIN TRIP T ON TM.TRIP_ID = T.trip_id
     WHERE U.aadhaar_no = $1`,
    [aadhaarNo]
  );
  console.log("User Details with Bookings:", result.rows);
}

async function listAccommodationsForTrip() {
  const specificTripId = await askQuestion("Enter Specific Trip ID: ");
  const result = await client.query(
    `SELECT A.stop_number, A.address, A.number_of_days_between_start_and_checkin, 
            A.duration_of_stay, A.checkin_time, A.checkout_time, A.contact_info
     FROM ACCOMMODATION A
     WHERE A.trip_id = $1`,
    [specificTripId]
  );
  console.log("Accommodations for Trip ID:", result.rows);
}

main();
