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

// Function to generate a random unique Aadhaar number (12 digits)
function generateRandomAadhaar() {
  // Generate a random 12-digit number
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

// Function to generate a valid 10-digit phone number
function generateRandomPhoneNumber() {
  // Generate a random 10-digit phone number starting with a valid prefix (7, 8, or 9)
  const firstDigit = Math.floor(Math.random() * 3) + 7; // Random digit 7, 8, or 9
  const remainingDigits = Math.floor(100000000 + Math.random() * 900000000); // Next 9 digits
  return `${firstDigit}${remainingDigits}`;
}

async function insertDataOfUser() {
  try {
    await client.connect();
    console.log("Connected to the database!");

    const insertSQL = `
            INSERT INTO tripUser (aadhaar_no, first_name, middle_name, last_name, phone_no, email)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

    for (let i = 0; i < 70; i++) {
      const values = [
        generateRandomAadhaar(), // Use the custom function to generate a random Aadhaar-like value
        faker.person.firstName(), // First name
        faker.person.middleName(), // Middle name
        faker.person.lastName(), // Last name
        generateRandomPhoneNumber(), // Use the custom function to generate a random 10-digit phone number
        faker.internet.email(), // Random email
      ];

      await client.query(insertSQL, values);
    }
    console.log("Inserted 70 dummy records.");
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    await client.end();
  }
}

insertDataOfUser();