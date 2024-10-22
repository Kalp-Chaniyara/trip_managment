    CREATE TABLE
        tripUser (
            aadhaar_no VARCHAR(12) PRIMARY KEY,
            first_name VARCHAR(20),
            middle_name VARCHAR(20),
            last_name VARCHAR(20),
            phone_no VARCHAR(10),
            email VARCHAR(100)
        );

    CREATE TABLE
        TRIP (
            trip_id serial PRIMARY KEY,
            description VARCHAR(500),
            duration INT,
            price DECIMAL(10, 2),
            total_stop INT
        );

    CREATE TABLE
        TEAM_MANAGEMENT (
            LEADER_ID VARCHAR(12),
            START_TIME_OF_TRIP timestamp,
            TRIP_ID INT,
            FOREIGN KEY (LEADER_ID) REFERENCES TRIPUSER (aadhaar_no),
            FOREIGN KEY (TRIP_ID) REFERENCES TRIP (trip_id),
            PRIMARY KEY (LEADER_ID, START_TIME_OF_TRIP)
        );

    CREATE TABLE
        TEAM_MEMBER (
            LEADER_ID VARCHAR(12),
            START_TIME_OF_TRIP timestamp,
            member_id VARCHAR(12),
            PRIMARY KEY (LEADER_ID, START_TIME_OF_TRIP, member_id),
            FOREIGN KEY (member_id) REFERENCES tripUser (aadhaar_no),
            FOREIGN KEY (LEADER_ID, START_TIME_OF_TRIP) REFERENCES TEAM_MANAGEMENT (LEADER_ID, START_TIME_OF_TRIP)
        );

    CREATE TABLE
        REVIEW (
            user_id VARCHAR(12),
            LEADER_ID VARCHAR(12),
            START_TIME_OF_TRIP timestamp,
            rating INT,
            comment TEXT,
            review_date DATE,
            FOREIGN KEY (user_id) REFERENCES tripUser (aadhaar_no),
            FOREIGN KEY (LEADER_ID, START_TIME_OF_TRIP) REFERENCES TEAM_MANAGEMENT (LEADER_ID, START_TIME_OF_TRIP),
            PRIMARY KEY (LEADER_ID, START_TIME_OF_TRIP, user_id),
            check (
                rating <= 5
                and rating >= 0
            )
        );

    CREATE TABLE
        PAYMENT (
            LEADER_ID VARCHAR(12),
            START_TIME_OF_TRIP timestamp,
            payment_method VARCHAR(50),
            payment_date DATE,
            amount_paid DECIMAL(10, 2),
            FOREIGN KEY (LEADER_ID, START_TIME_OF_TRIP) REFERENCES TEAM_MANAGEMENT (LEADER_ID, START_TIME_OF_TRIP),
            PRIMARY KEY (LEADER_ID, START_TIME_OF_TRIP)
        );

    CREATE TABLE
        ACCOMMODATION (
            stop_number INT,
            trip_id INT,
            address TEXT,
            number_of_days_between_start_and_checkin INT,
            duration_of_stay INT,
            checkin_time TIME,
            checkout_time TIME,
            contact_info VARCHAR(100),
            PRIMARY KEY (stop_number, trip_id),
            FOREIGN KEY (trip_id) REFERENCES TRIP (trip_id)
        );

    CREATE TABLE
        CITY (
            cityname VARCHAR(100),
            statename varchar(50),
            district_name VARCHAR(100),
            PRIMARY key (cityname, statename)
        );

    CREATE TABLE
        ROUTESTOP (
            stop_number INT,
            trip_id INT,
            city VARCHAR(100),
            statename varchar(50),
            PRIMARY KEY (stop_number, trip_id),
            FOREIGN KEY (trip_id) REFERENCES TRIP (trip_id),
            FOREIGN KEY (city, statename) REFERENCES city (cityname, statename)
        );

    CREATE TABLE
        ACTIVITY (
            stop_number INT,
            trip_id INT,
            duration INT,
            name VARCHAR(100),
            description TEXT,
            PRIMARY KEY (stop_number, trip_id),
            FOREIGN KEY (trip_id) REFERENCES TRIP (trip_id)
        )


