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
├── ddl_property_rental.sql
├── property_rental_data.sql
└── README.md
```

---

## Database Setup (MySQL)

Open MySQL Workbench and run:

```sql
CREATE DATABASE IF NOT EXISTS property_rental;

CREATE USER 'django_user'@'localhost' IDENTIFIED BY 'cpsc471';
GRANT ALL PRIVILEGES ON property_rental.* TO 'django_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## Backend Setup

```bash
cd rental-website-project-main/backend
pip install django djangorestframework django-cors-headers pymysql cryptography
python manage.py migrate
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

To clear all data:

```powershell
cd backend
python manage.py flush
python manage.py migrate
python manage.py runserver
```

Then in another terminal:

```powershell
cd frontend
npm run dev
```

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

- Data is stored in MySQL and persists between sessions
- Closing the app does not delete users or data
- Duplicate appointment booking is prevented in backend logic
- If pages appear empty, the database likely has no data yet

---

## Common Issues

### Backend won't start
- MySQL is not running
- Wrong database credentials
- Required Python packages are not installed

### Frontend won't start
- Node.js is not installed
- `npm install` was not run

### Empty UI
- No data has been created yet

---

## Summary

This project demonstrates:
- full-stack web development
- relational database integration
- REST API design
- multi-role user workflows
