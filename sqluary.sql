select
    mt.trip_id
from
    TEAM_MEMBER as m
    join TEAM_MANAGEMENT as mt on m.LEADER_ID = mt.LEADER_ID
    and m.START_TIME_OF_TRIP = mt.START_TIME_OF_TRIP
where
    m.member_id = '123456789012';






SELECT
    city
from
    routestop
where
    trip_id = 2;



select
    rating,
    comment
from
    review
where
    concat (LEADER_ID, START_TIME_OF_TRIP) in (
        select
            concat (LEADER_ID, START_TIME_OF_TRIP)
        from
            TEAM_MANAGEMENT
        where
            trip_id = 2
    )



select
    sum(memcount)*(select price from trip where trip_id=2) as total
from
    (
        select
            count(member_id) as memcount
        from
            team_member
        where
            concat (LEADER_ID, START_TIME_OF_TRIP) in (
                select
                    concat (LEADER_ID, START_TIME_OF_TRIP)
                from
                    TEAM_MANAGEMENT
                where
                    trip_id = 2
            )
    ) as f




-- 7 Find all trips within a specific date range.
SELECT T.trip_id, T.description, T.duration, T.price, T.total_stop
FROM TEAM_MANAGEMENT TM
JOIN TRIP T ON TM.TRIP_ID = T.trip_id
WHERE TM.START_TIME_OF_TRIP BETWEEN 'start_date' AND 'end_date';


-- 8 Retrieve user details along with their bookings


SELECT U.aadhaar_no, U.first_name, U.middle_name, U.last_name, U.phone_no, U.email, 
       TM.TRIP_ID, T.description, T.duration, T.price
FROM tripUser U
JOIN TEAM_MANAGEMENT TM ON U.aadhaar_no = TM.LEADER_ID
JOIN TRIP T ON TM.TRIP_ID = T.trip_id;



-- 9 List all accommodations for a specific trip


SELECT A.stop_number, A.address, A.number_of_days_between_start_and_checkin, 
       A.duration_of_stay, A.checkin_time, A.checkout_time, A.contact_info
FROM ACCOMMODATION A
WHERE A.trip_id = specific_trip_id;




















