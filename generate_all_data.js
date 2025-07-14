import dotenv from "dotenv";
dotenv.config();
import pkg from "pg";
const { Client } = pkg;
import { faker } from "@faker-js/faker";

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Parameters for data volume
const NUM_USERS = 50;
const NUM_TRIPS = 20;
const NUM_CITIES = 15;
const NUM_TEAM_MANAGEMENT = 30;
const MIN_TEAM_MEMBERS = 2;
const MAX_TEAM_MEMBERS = 6;
const MAX_STOPS = 5;
const MAX_ACTIVITIES_PER_STOP = 3;

// Utility to get random elements
function getRandomElements(arr, n) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

async function main() {
  await client.connect();
  console.log("Connected to DB");

  // 1. Generate Users
  const users = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const aadhaar_no = faker.string.numeric({ length: 12 });
    users.push({
      aadhaar_no,
      first_name: faker.person.firstName(),
      middle_name: faker.person.middleName(),
      last_name: faker.person.lastName(),
      phone_no: faker.string.numeric({ length: 10 }),
      email: faker.internet.email(),
    });
  }
  for (const u of users) {
    await client.query(
      `INSERT INTO tripUser (aadhaar_no, first_name, middle_name, last_name, phone_no, email) VALUES ($1, $2, $3, $4, $5, $6)`,
      [u.aadhaar_no, u.first_name, u.middle_name, u.last_name, u.phone_no, u.email]
    );
  }
  console.log("Inserted users");

  // 2. Generate Cities
  const states = ["Maharashtra", "Gujarat", "Karnataka", "Rajasthan", "Goa"];
  const cities = [];
  for (let i = 0; i < NUM_CITIES; i++) {
    const cityname = faker.location.city();
    const statename = faker.helpers.arrayElement(states);
    const district_name = faker.location.county();
    cities.push({ cityname, statename, district_name });
  }
  for (const c of cities) {
    await client.query(
      `INSERT INTO CITY (cityname, statename, district_name) VALUES ($1, $2, $3)`,
      [c.cityname, c.statename, c.district_name]
    );
  }
  console.log("Inserted cities");

  // 3. Generate Trips
  const trips = [];
  for (let i = 0; i < NUM_TRIPS; i++) {
    const res = await client.query(
      `INSERT INTO TRIP (description, duration, price, total_stop) VALUES ($1, $2, $3, $4) RETURNING trip_id`,
      [
        faker.lorem.sentence(),
        faker.number.int({ min: 2, max: 15 }),
        faker.number.float({ min: 100, max: 2000, precision: 0.01 }),
        faker.number.int({ min: 2, max: MAX_STOPS }),
      ]
    );
    trips.push({ trip_id: res.rows[0].trip_id });
  }
  console.log("Inserted trips");

  // 4. Generate TEAM_MANAGEMENT (trip instances)
  const teamManagements = [];
  for (let i = 0; i < NUM_TEAM_MANAGEMENT; i++) {
    const leader = faker.helpers.arrayElement(users);
    const trip = faker.helpers.arrayElement(trips);
    const startTime = faker.date.between({ from: "2024-01-01", to: "2024-12-31" });
    await client.query(
      `INSERT INTO TEAM_MANAGEMENT (LEADER_ID, START_TIME_OF_TRIP, TRIP_ID) VALUES ($1, $2, $3)`,
      [leader.aadhaar_no, startTime, trip.trip_id]
    );
    teamManagements.push({
      LEADER_ID: leader.aadhaar_no,
      START_TIME_OF_TRIP: startTime,
      TRIP_ID: trip.trip_id,
    });
  }
  console.log("Inserted team managements");

  // 5. Generate TEAM_MEMBER (members for each trip instance)
  const teamMembers = [];
  for (const tm of teamManagements) {
    // Always include the leader as a member
    const numMembers = faker.number.int({ min: MIN_TEAM_MEMBERS, max: MAX_TEAM_MEMBERS });
    const possibleMembers = users.filter(u => u.aadhaar_no !== tm.LEADER_ID);
    const members = getRandomElements(possibleMembers, numMembers - 1);
    members.unshift(users.find(u => u.aadhaar_no === tm.LEADER_ID)); // add leader
    for (const m of members) {
      await client.query(
        `INSERT INTO TEAM_MEMBER (LEADER_ID, START_TIME_OF_TRIP, member_id) VALUES ($1, $2, $3)`,
        [tm.LEADER_ID, tm.START_TIME_OF_TRIP, m.aadhaar_no]
      );
      teamMembers.push({
        LEADER_ID: tm.LEADER_ID,
        START_TIME_OF_TRIP: tm.START_TIME_OF_TRIP,
        member_id: m.aadhaar_no,
        TRIP_ID: tm.TRIP_ID,
      });
    }
  }
  console.log("Inserted team members");

  // 6. Generate ROUTESTOP for each trip
  const routeStops = [];
  for (const trip of trips) {
    const numStops = faker.number.int({ min: 2, max: MAX_STOPS });
    const usedCities = getRandomElements(cities, numStops);
    for (let stop = 1; stop <= numStops; stop++) {
      const city = usedCities[stop - 1];
      await client.query(
        `INSERT INTO ROUTESTOP (stop_number, trip_id, city, statename) VALUES ($1, $2, $3, $4)`,
        [stop, trip.trip_id, city.cityname, city.statename]
      );
      routeStops.push({ stop_number: stop, trip_id: trip.trip_id, city: city.cityname, statename: city.statename });
    }
  }
  console.log("Inserted route stops");

  // 7. Generate ACCOMMODATION for each stop
  for (const rs of routeStops) {
    await client.query(
      `INSERT INTO ACCOMMODATION (stop_number, trip_id, address, number_of_days_between_start_and_checkin, duration_of_stay, checkin_time, checkout_time, contact_info) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        rs.stop_number,
        rs.trip_id,
        faker.location.streetAddress(),
        faker.number.int({ min: 0, max: 3 }),
        faker.number.int({ min: 1, max: 5 }),
        faker.date.anytime().toTimeString().slice(0, 8),
        faker.date.anytime().toTimeString().slice(0, 8),
        faker.phone.number(),
      ]
    );
  }
  console.log("Inserted accommodations");

  // 8. Generate ACTIVITY for each stop
  // 8. Generate ACTIVITY for each stop (only one activity per stop)
for (const rs of routeStops) {
  await client.query(
    `INSERT INTO ACTIVITY (stop_number, trip_id, duration, name, description) VALUES ($1, $2, $3, $4, $5)`,
    [
      rs.stop_number,
      rs.trip_id,
      faker.number.int({ min: 1, max: 8 }),
      faker.lorem.words({ min: 1, max: 3 }),
      faker.lorem.sentence(),
    ]
  );
}
  console.log("Inserted activities");

  // 9. Generate PAYMENT for each TEAM_MANAGEMENT
  for (const tm of teamManagements) {
    await client.query(
      `INSERT INTO PAYMENT (LEADER_ID, START_TIME_OF_TRIP, payment_method, payment_date, amount_paid) VALUES ($1, $2, $3, $4, $5)`,
      [
        tm.LEADER_ID,
        tm.START_TIME_OF_TRIP,
        faker.helpers.arrayElement(["Credit Card", "UPI", "Cash", "Net Banking"]),
        faker.date.between({ from: tm.START_TIME_OF_TRIP, to: "2024-12-31" }),
        faker.number.float({ min: 100, max: 2000, precision: 0.01 }),
      ]
    );
  }
  console.log("Inserted payments");

  // 10. Generate REVIEW for each TEAM_MEMBER (each member reviews their trip instance)
  for (const tm of teamMembers) {
    // Each member can review their trip instance
    await client.query(
      `INSERT INTO REVIEW (user_id, LEADER_ID, START_TIME_OF_TRIP, rating, comment, review_date) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        tm.member_id,
        tm.LEADER_ID,
        tm.START_TIME_OF_TRIP,
        faker.number.int({ min: 1, max: 5 }),
        faker.lorem.sentence(),
        faker.date.between({ from: tm.START_TIME_OF_TRIP, to: "2024-12-31" }),
      ]
    );
  }
  console.log("Inserted reviews");

  await client.end();
  console.log("All data generated and inserted successfully!");
}

main().catch(e => { console.error(e); client.end(); }); 