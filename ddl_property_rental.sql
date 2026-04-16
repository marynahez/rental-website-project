USE property_rental;

CREATE TABLE IF NOT EXISTS USER (
    UserID INT NOT NULL,
    FName VARCHAR(50),
    LName VARCHAR(50),
    Email VARCHAR(100) UNIQUE,
    UserType ENUM('ProspectiveRenter','Tenant','PropertyManager'),
    PRIMARY KEY (UserID)
);

CREATE TABLE IF NOT EXISTS PROPERTY (
    PropertyID INT NOT NULL,
    ManagerID INT NOT NULL,
    Province VARCHAR(50),
    City VARCHAR(50),
    StName VARCHAR(100),
    PostCode VARCHAR(20),
    Suite VARCHAR(20),
    Appart VARCHAR(20),
    IsRented BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (PropertyID),
    FOREIGN KEY (ManagerID) REFERENCES USER(UserID)
);

-- UserID in RENTAL_LISTING refers to the manager who posted the listing
CREATE TABLE IF NOT EXISTS RENTAL_LISTING (
    ListingID INT NOT NULL,
    Price DECIMAL(7,2),
    Description TEXT,
    DatePosted DATE,
    Status ENUM('Active','Inactive','Rented','Closed'),
    UserID INT NOT NULL,
    PropertyID INT NOT NULL,
    PRIMARY KEY (ListingID),
    FOREIGN KEY (UserID) REFERENCES USER(UserID),
    FOREIGN KEY (PropertyID) REFERENCES PROPERTY(PropertyID)
);

CREATE TABLE IF NOT EXISTS APPOINTMENT (
    AppointID INT NOT NULL,
    Status ENUM('Pending','Confirmed','Cancelled','Completed'),
    UserID INT,
    ListingID INT,
    PRIMARY KEY (AppointID),
    FOREIGN KEY (UserID) REFERENCES USER(UserID)
);

CREATE TABLE IF NOT EXISTS TIME_SLOT (
    AppointID INT NOT NULL,
    SlotNum INT NOT NULL,
    Day INT,
    Month INT,
    Year INT,
    PRIMARY KEY (AppointID, SlotNum),
    FOREIGN KEY (AppointID) REFERENCES APPOINTMENT(AppointID)
);

-- UserID in LEASE_RECORD refers to the tenant who signed the lease
CREATE TABLE IF NOT EXISTS LEASE_RECORD (
    LeaseID INT NOT NULL,
    StartDate DATE,
    EndDate DATE,
    SecurityDep DECIMAL(7,2),
    MonthlyRent DECIMAL(7,2),
    UserID INT,
    PropertyID INT,
    PRIMARY KEY (LeaseID),
    FOREIGN KEY (UserID) REFERENCES USER(UserID),
    FOREIGN KEY (PropertyID) REFERENCES PROPERTY(PropertyID)
);

CREATE TABLE IF NOT EXISTS RENT_PAYMENT (
    PaytID INT NOT NULL,
    PayDate DATE,
    Amount DECIMAL(7,2),
    Method ENUM('Cash','CreditCard','DebitCard','Transfer'),
    Status ENUM('Pending','Completed','Failed'),
    LeaseID INT,
    PRIMARY KEY (PaytID),
    FOREIGN KEY (LeaseID) REFERENCES LEASE_RECORD(LeaseID)
);

CREATE TABLE IF NOT EXISTS MANAGEMENT_REQUEST (
    RequestID INT NOT NULL,
    DateSubm DATE,
    Status ENUM('Pending','Approved','Rejected','Completed'),
    Permission ENUM('Granted','Denied','Pending'),
    Description TEXT,
    UserID INT,
    PropertyID INT,
    PRIMARY KEY (RequestID),
    FOREIGN KEY (UserID) REFERENCES USER(UserID),
    FOREIGN KEY (PropertyID) REFERENCES PROPERTY(PropertyID)
);