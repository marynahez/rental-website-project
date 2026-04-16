USE property_rental;

/*
Reset all data before re-inserting seed data
*/

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE RENTAL_LISTING;
TRUNCATE TABLE MANAGEMENT_REQUEST;
TRUNCATE TABLE RENT_PAYMENT;
TRUNCATE TABLE LEASE_RECORD;
TRUNCATE TABLE TIME_SLOT;
TRUNCATE TABLE APPOINTMENT;
TRUNCATE TABLE PROPERTY;
TRUNCATE TABLE USER;

SET FOREIGN_KEY_CHECKS = 1;

-- USERS

INSERT INTO USER (UserID, FName, LName, Email, UserType) VALUES
-- Maryna (3 roles, one account)
(1001, 'Maryna', 'Hez',     'Marina989898@gmail.com',          'ProspectiveRenter'),
(1002, 'Maryna', 'Hez',     'Marina989898@gmail.com',          'Tenant'),
(1003, 'Maryna', 'Hez',     'Marina989898@gmail.com',          'PropertyManager'),

-- Other Managers
(367,  'Priya',  'Sandhu',  'priya.sandhu@urbanlane.ca',       'PropertyManager'),
(556,  'Sofia',  'Tran',    'sofia.tran@rentflow.ca',          'PropertyManager'),
(561,  'Daniel', 'Kim',     'daniel.kim@leasehub.ca',          'PropertyManager'),
(1004, 'James',  'Walker',  'james.walker@pmgroup.ca',         'PropertyManager'),
(1005, 'Rachel', 'Huang',   'rachel.huang@citylease.ca',       'PropertyManager'),

-- Tenants
(214,  'Ethan',  'Vale',    'ethan.vale@maplehub.ca',          'Tenant'),
(555,  'Lucas',  'Bennett', 'lucas.bennett@homeway.ca',        'Tenant'),
(558,  'Ava',    'Morin',   'ava.morin@tenanthub.ca',          'Tenant'),
(559,  'Liam',   'Brooks',  'liam.brooks@urbanmail.ca',        'Tenant'),
(562,  'Olivia', 'Nguyen',  'olivia.nguyen@tenantspot.ca',     'Tenant'),

-- Prospective Renters
(101,  'Mila',   'Kovren',  'mila.kovren27@northmail.ca',      'ProspectiveRenter'),
(557,  'Noah',   'Petrov',  'noah.petrov@citymail.ca',         'ProspectiveRenter'),
(560,  'Emma',   'Roy',     'emma.roy@renthouse.ca',           'ProspectiveRenter'),
(563,  'Mason',  'Clarke',  'mason.clarke@cityrent.ca',        'ProspectiveRenter'),
(564,  'Chloe',  'Park',    'chloe.park@searchrent.ca',        'ProspectiveRenter');

-- PROPERTIES

INSERT INTO PROPERTY (PropertyID, ManagerID, Province, City, StName, PostCode, Suite, Appart, IsRented) VALUES
-- Maryna (1003) as a manager has Calgary properties
(5021, 1003, 'Alberta', 'Calgary', 'Evanston View NW', 'T3P 0H5', 'Unit 12', 'A', TRUE),
(6101, 1003, 'Alberta', 'Calgary', 'Centre Street N', 'T2E 2X6', NULL, '104', FALSE),
(6109, 1003, 'Alberta', 'Calgary', '17 Avenue SW', 'T2T 0A1', 'Unit 6', '19', FALSE),

-- Priya (367): Vancouver, Burnaby, Winnipeg, Saskatoon, Ottawa, Hamilton
(6384, 367, 'British Columbia', 'Vancouver', 'West 8th Avenue', 'V6H 2W6', NULL, '302', FALSE),
(6103, 367, 'British Columbia', 'Burnaby', 'Kingsway', 'V5H 2A9', NULL, '221', FALSE),
(7912, 367, 'Manitoba', 'Winnipeg', 'Bank Street', 'R3C 1A5', 'Suite 5B', '55', TRUE),
(6105, 367, 'Saskatchewan', 'Saskatoon', 'College Drive', 'S7N 0W3', NULL, '15', FALSE),
(6107, 367, 'Ontario', 'Ottawa', 'Elgin Street', 'K2P 1L4', NULL, '411', FALSE),
(6111, 367, 'Ontario', 'Hamilton', 'Main Street West', 'L8S 1A2', 'Suite 1', '3', FALSE),

-- Sofia (556): Toronto, Edmonton, Halifax, Montreal
(6102, 556, 'Ontario',          'Toronto',    'Bloor Street West',    'M6G 1L8', 'Suite 8', '12',  TRUE),
(6104, 556, 'Alberta',          'Edmonton',   'Whyte Avenue',         'T6E 1Z9', 'Unit 3',  '7',   TRUE),
(6106, 556, 'Nova Scotia',      'Halifax',    'Spring Garden Road',   'B3J 1E9', 'Suite 2A','8',   TRUE),
(6108, 556, 'Quebec',           'Montreal',   'Rue Sherbrooke Ouest', 'H3A 1B2', NULL,      '210', TRUE),

-- Daniel (561): Victoria, Red Deer
(6110, 561, 'British Columbia', 'Victoria',   'Douglas Street',       'V8W 2C5', NULL,      '509', TRUE),
(6112, 561, 'Alberta',          'Red Deer',   'Gaetz Avenue',         'T4N 4C7', NULL,      '101', TRUE),

-- James Walker (1004): BC & Ontario
(6201, 1004, 'British Columbia', 'Vancouver', 'Main Street',          'V5V 3J3', NULL,      '405', FALSE),
(6202, 1004, 'Ontario',          'Toronto',   'Queen Street West',    'M6J 1E4', 'Unit 2',  '8',   FALSE),
(6203, 1004, 'British Columbia', 'Kelowna',   'Bernard Avenue',       'V1Y 6N4', NULL,      '112', TRUE),

-- Rachel Huang (1005): Quebec & Manitoba
(6301, 1005, 'Quebec',           'Montreal',  'Avenue du Parc',       'H2V 4H5', 'Suite 3', '6',   FALSE),
(6302, 1005, 'Manitoba',         'Winnipeg',  'Portage Avenue',       'R3C 0C4', NULL,      '201', TRUE),
(6303, 1005, 'Quebec',           'Quebec City','Grande Allée',        'G1R 2H3', NULL,      '18',  FALSE);

-- RENTAL LISTINGS

INSERT INTO RENTAL_LISTING (ListingID, Price, Description, DatePosted, Status, UserID, PropertyID) VALUES
-- Maryna (1003)
(8501, 1600.00, 'Modern Calgary apartment near C-Train, balcony, great transit access.',       '2026-03-01', 'Active',   1003, 5021),
(8502, 1450.00, 'Bright Centre Street unit with city views and underground parking.',           '2026-03-10', 'Active',   1003, 6101),
(8503, 1680.00, 'Stylish Beltline apartment - walkable to shops, restaurants, and transit.',   '2026-03-20', 'Active',   1003, 6109),

-- Priya (367)
(8105, 1600.00, 'Cozy basement apartment near C-Train. Small balcony, easy transit access.',   '2026-02-20', 'Rented',   367, 6105),
(8261, 1850.00, 'Spacious 3-room Winnipeg apartment, two parking spaces, quiet street.',       '2025-12-15', 'Rented',   367, 7912),
(8344, 1450.00, 'Compact Vancouver unit, good natural light, suitable for couple or single.',  '2026-01-30', 'Inactive', 367, 6384),
(8403, 1580.00, 'Bright Burnaby apartment, close to SkyTrain and community amenities.',        '2026-03-08', 'Active',   367, 6103),
(8405, 1340.00, 'Affordable Saskatoon apartment with good bus access.',                        '2026-03-11', 'Active',   367, 6105),
(8407, 1890.00, 'Ottawa central location apartment with parking included.',                    '2026-01-20', 'Active',   367, 6107),
(8409, 1680.00, 'Hamilton apartment close to campus and local shops.',                         '2026-03-14', 'Active',   367, 6111),

-- Sofia (556)
(8402, 2200.00, 'Large Toronto family unit, updated kitchen and in-suite laundry.',            '2026-02-10', 'Rented',   556, 6102),
(8404, 1725.00, 'Edmonton university-area rental, suitable for students and professionals.',   '2026-01-12', 'Rented',   556, 6104),
(8406, 1995.00, 'Renovated Halifax apartment near downtown core.',                             '2026-02-25', 'Closed',   556, 6106),
(8408, 2100.00, 'Montreal apartment with large windows and updated bathroom.',                 '2026-02-17', 'Rented',   556, 6108),

-- Daniel (561)
(8410, 1950.00, 'Victoria ocean-view balcony apartment.',                                      '2026-02-02', 'Rented',   561, 6110),
(8412, 1380.00, 'Red Deer starter apartment - simple layout, low maintenance.',                '2026-02-28', 'Inactive', 561, 6112),

-- James Walker (1004)
(8601, 1750.00, 'Vancouver Main Street loft-style unit near cafes and transit.',               '2026-03-15', 'Active',   1004, 6201),
(8602, 2050.00, 'Toronto Queen West apartment, trendy neighbourhood, modern finishes.',        '2026-03-18', 'Active',   1004, 6202),
(8603, 1620.00, 'Kelowna apartment close to waterfront and Okanagan amenities.',               '2026-02-28', 'Rented',   1004, 6203),

-- Rachel Huang (1005)
(8701, 1550.00, 'Montreal Parc Avenue unit in vibrant Mile-End neighbourhood.',                '2026-03-22', 'Active',   1005, 6301),
(8702, 1480.00, 'Winnipeg Portage Avenue apartment, central location, transit nearby.',        '2026-03-05', 'Rented',   1005, 6302),
(8703, 1390.00, 'Quebec City Grande Allée unit near historic district and parks.',             '2026-04-01', 'Active',   1005, 6303);
-- APPOINTMENTS

INSERT INTO APPOINTMENT (AppointID, Status, UserID) VALUES
(4107, 'Pending',   101),
(5284, 'Confirmed', 214),
(6739, 'Completed', 557),
(7001, 'Pending',   1001),
(7002, 'Confirmed', 557),
(7003, 'Cancelled', 560),
(7004, 'Completed', 563),
(7005, 'Pending',   1001),
(7006, 'Confirmed', 101),
(7007, 'Completed', 214),
(7008, 'Pending',   564),
(7009, 'Confirmed', 560);

-- TIME SLOTS

INSERT INTO TIME_SLOT (AppointID, SlotNum, Day, Month, Year) VALUES
(4107, 1, 18, 3, 2026),
(5284, 1, 20, 3, 2026),
(6739, 1, 12, 3, 2026),
(7001, 1, 22, 4, 2026),
(7002, 1, 24, 4, 2026),
(7003, 1, 26, 4, 2026),
(7004, 1, 28, 4, 2026),
(7005, 1, 30, 4, 2026),
(7006, 1,  2, 5, 2026),
(7007, 1,  5, 5, 2026),
(7008, 1, 10, 5, 2026),
(7009, 1, 14, 5, 2026);

-- LEASE RECORDS

INSERT INTO LEASE_RECORD (LeaseID, StartDate, EndDate, SecurityDep, MonthlyRent, UserID, PropertyID) VALUES
(9001, '2026-01-01', '2026-12-31', 1200.00, 1850.00, 214, 7912),
(9002, '2026-04-01', '2027-03-31', 1000.00, 1600.00, 214, 5021),
(9003, '2025-09-01', '2026-08-31', 1100.00, 2200.00, 558, 6102),
(9004, '2026-02-01', '2027-01-31',  900.00, 1725.00, 555, 6104),
(9005, '2025-11-15', '2026-11-14', 1050.00, 1995.00, 562, 6106),
(9006, '2026-03-01', '2027-02-28', 1150.00, 2100.00, 559, 6108),
(9007, '2025-12-01', '2026-11-30',  980.00, 1950.00, 214, 6110),
(9008, '2026-01-15', '2027-01-14',  850.00, 1380.00, 558, 6112),
(9009, '2026-03-15', '2027-03-14',  950.00, 1700.00, 562, 6203),
(9010, '2026-04-01', '2027-03-31', 1000.00, 1850.00, 555, 6302);

-- RENT PAYMENTS

INSERT INTO RENT_PAYMENT (PaytID, PayDate, Amount, Method, Status, LeaseID) VALUES
(30011, '2026-01-03', 1850.00, 'Transfer',    'Completed', 9001),
(30027, '2026-02-03', 1850.00, 'DebitCard',   'Completed', 9001),
(30045, '2026-04-02', 1600.00, 'CreditCard',  'Pending',   9002),
(30046, '2026-04-05', 2200.00, 'Transfer',    'Completed', 9003),
(30047, '2026-03-04', 1725.00, 'DebitCard',   'Completed', 9004),
(30048, '2026-03-06', 1995.00, 'Transfer',    'Failed',    9005),
(30049, '2026-04-03', 2100.00, 'Transfer',    'Completed', 9006),
(30050, '2026-02-01', 1950.00, 'Cash',        'Completed', 9007),
(30051, '2026-04-01', 1380.00, 'DebitCard',   'Pending',   9008),
(30052, '2026-05-01', 1600.00, 'Transfer',    'Pending',   9002),
(30053, '2026-05-02', 1380.00, 'CreditCard',  'Pending',   9008),
(30054, '2026-04-15', 1700.00, 'Transfer',    'Completed', 9009),
(30055, '2026-04-01', 1850.00, 'DebitCard',   'Pending',   9010);

-- MANAGEMENT REQUESTS

INSERT INTO MANAGEMENT_REQUEST (RequestID, DateSubm, Status, Permission, Description, UserID, PropertyID) VALUES
(7101, '2026-03-05', 'Pending',   'Pending', 'Mold on bathroom ceiling needs inspection.',                   214, 7912),
(7248, '2026-03-07', 'Approved',  'Granted', 'Away for a month — informing property manager in advance.',   214, 5021),
(7390, '2026-03-12', 'Completed', 'Granted', 'Washing machine not working — required repair.',               214, 7912),
(7391, '2026-03-18', 'Rejected',  'Denied',  'Request to paint bedroom walls dark blue.',                    558, 6102),
(7392, '2026-03-22', 'Approved',  'Granted', 'Permission to install baby safety gates.',                    555, 6104),
(7393, '2026-03-25', 'Pending',   'Pending', 'Kitchen sink leaking under the cabinet.',                     562, 6106),
(7394, '2026-03-29', 'Completed', 'Granted', 'Heating issue in bedroom resolved.',                          559, 6108),
(7395, '2026-04-01', 'Pending',   'Pending', 'Request for additional parking permit.',                       214, 6110),
(7396, '2026-04-03', 'Approved',  'Granted', 'Balcony door lock needs replacement.',                        558, 6112),
(7397, '2026-04-05', 'Pending',   'Pending', 'Window condensation and possible insulation concern.',         555, 6104),
(7398, '2026-04-10', 'Pending',   'Pending', 'Dishwasher not draining properly.',                           562, 6203),
(7399, '2026-04-12', 'Approved',  'Granted', 'Request to install a ceiling fan in the living room.',        555, 6302);
