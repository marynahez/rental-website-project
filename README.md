# RentCA — Rental Property Management System

**CPSC 471 · Group G-31**  
Maryna Hez, Sage Kennard, Alexander Firth

---

## Overview

RentCA is a web-based rental property management system designed to streamline rental operations for:

- Property Managers
- Tenants
- Prospective Renters

The system supports:
- browsing rental listings
- booking viewing appointments
- managing properties and listings
- lease tracking
- rent payment tracking
- maintenance/management requests

---

## Tech Stack

| Layer     | Technology   |
|-----------|--------------|
| Frontend  | React + Vite |
| Backend   | Django + DRF |
| Database  | MySQL        |

---

## Project Structure

```text
rental-website-project-main/
├── backend/
│   ├── manage.py
│   ├── rental_project/
│   │   ├── settings.py
│   │   ├── urls.py
│   └── rental_app/
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       ├── urls.py
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── docs/
│   ├── EERD_diagram_updated.png
│   └── RM_diagram_updated.png
│ 
├── ddl_property_rental.sql
├── property_rental_data.sql
└── README.md
```

---

## Database Setup (MySQL)

This project uses MySQL with a provided schema and demo dataset.

### Step 1 — Create Database

Open MySQL Workbench and run:

```sql
CREATE DATABASE IF NOT EXISTS property_rental;

CREATE USER 'django_user'@'localhost' IDENTIFIED BY 'cpsc471';
GRANT ALL PRIVILEGES ON property_rental.* TO 'django_user'@'localhost';
FLUSH PRIVILEGES;
```

---

### Step 2 — Apply Django Migrations

```bash
cd rental-website-project-main/backend
python manage.py migrate
```

This creates the database structure required by Django.

---

### Step 3 — Load Demo Data (IMPORTANT)

The repository includes a prebuilt dataset:

```
property_rental_data.sql
```

To load it:

1. Open MySQL Workbench  
2. Select the `property_rental` database  
3. Open `property_rental_data.sql`  
4. Run the script (⚡ button)

---

### ⚠️ Important Notes

- This script will **DELETE all existing data** before inserting demo data  
- It loads:
  - users (including demo account)
  - properties
  - listings
  - appointments
  - leases
  - payments
  - management requests  

- This is the **recommended setup for testing and demonstration**

---

## Backend Setup

```bash
cd rental-website-project-main/backend
pip install django djangorestframework django-cors-headers pymysql cryptography
python manage.py runserver
```

Backend runs at:

```
http://127.0.0.1:8000/
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:3000/
```

---

## Normal Workflow

### Terminal 1 (backend)

```powershell
cd backend
python manage.py runserver
```

### Terminal 2 (frontend)

```powershell
cd frontend
npm run dev
```

---

## Reset Workflow

To reset the database using demo data:

```powershell
cd backend
python manage.py flush
python manage.py migrate
```

Then reload the dataset:

1. Open MySQL Workbench  
2. Run `property_rental_data.sql` again  

Then restart backend:

```powershell
python manage.py runserver
```

---

## Demo Account

After loading the dataset, use:

- Email: `Marina989898@gmail.com`
- Password: `123456789A`

This account includes:

- Property Manager role (with properties and listings)
- Tenant role (with leases and payments)
- Prospective Renter role (with appointments)

---

## Core Features

### Property Manager
- Create and manage properties
- Create and manage listings
- View and update appointments
- Confirm / cancel / complete bookings
- Manage lease records
- Review rent payments
- Handle maintenance requests

### Tenant
- View lease details
- View and submit rent payments
- Submit management requests
- Track request status

### Prospective Renter
- Browse listings
- Filter by city and price
- Book viewing appointments
- Track appointment status

---

## Example Usage Flow

Example workflow illustrating system functionality:

```
Property Manager creates property
→ Property Manager creates listing
→ Prospective Renter books appointment
→ Property Manager confirms appointment
```

---

## API Endpoints

### Users
- `GET /api/users/`
- `POST /api/users/`

### Properties
- `GET /api/properties/`
- `POST /api/properties/`

### Listings
- `GET /api/listings/`
- `POST /api/listings/`

Filters:
- `?status=Active`
- `?city=Calgary`
- `?min_price=1000`

### Appointments
- `GET /api/appointments/`
- `POST /api/appointments/book/`
- `POST /api/appointments/<id>/confirm/`
- `POST /api/appointments/<id>/cancel/`
- `POST /api/appointments/<id>/complete/`

### Lease Records
- `GET /api/leases/`

### Payments
- `GET /api/payments/`
- `POST /api/payments/<id>/approve/`

### Requests
- `GET /api/requests/`
- `POST /api/requests/<id>/approve/`
- `POST /api/requests/<id>/reject/`
- `POST /api/requests/<id>/complete/`

---

## Models → Database Mapping

| Model              | Table               |
|-------------------|---------------------|
| User              | USER                |
| Property          | PROPERTY            |
| Appointment       | APPOINTMENT         |
| TimeSlot          | TIME_SLOT           |
| LeaseRecord       | LEASE_RECORD        |
| RentPayment       | RENT_PAYMENT        |
| ManagementRequest | MANAGEMENT_REQUEST  |
| RentalListing     | RENTAL_LISTING      |

---

## Notes

- The project uses a **preloaded demo dataset** for testing
- Data is stored in MySQL and persists between sessions
- Duplicate appointment booking is prevented in backend logic
- If pages appear empty, the dataset may not be loaded

---

## Common Issues

### Backend won't start
- MySQL is not running
- Wrong database credentials
- Required Python packages are not installed

### Frontend won't start
- Node.js is not installed
- `npm install` was not run

### Login not working
- Ensure the demo dataset is loaded
- Use the provided demo account

### Empty UI
- Run `property_rental_data.sql`

---

## Summary

This project demonstrates:
- full-stack web development
- relational database integration
- REST API design
- multi-role user workflows
