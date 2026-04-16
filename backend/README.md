# Rental Property Management System — Backend (Django)

**CPSC 471 · Group G-31**
Maryna Hez, Sage Kennard, Alexander Firth

---

## Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | React.js                |
| Backend   | Django (Python)         |
| Database  | MySQL                   |

---

## Project Structure

```
rental_project/
├── manage.py                    # Django CLI entry point
├── rental_project/              # Project configuration
│   ├── settings.py              # DB, CORS, REST settings
│   ├── urls.py                  # Root URL routing
│   └── wsgi.py                  # WSGI application
└── rental_app/                  # Main application
    ├── models.py                # 8 model classes (DDL mapping)
    ├── serializers.py           # DRF serializers
    ├── views.py                 # API ViewSets + custom actions
    ├── urls.py                  # API endpoint routing
    ├── admin.py                 # Django admin registration
    └── apps.py                  # App configuration
```

---

## Setup Instructions

### 1. Install dependencies

```bash
pip install django djangorestframework django-cors-headers mysqlclient
```

### 2. Create MySQL database

```sql
CREATE DATABASE property_rental;
```

### 3. Configure database credentials

Edit `rental_project/settings.py` → `DATABASES` section:

```python
'USER': 'your_mysql_username',
'PASSWORD': 'your_mysql_password',
```

### 4. Run migrations

```bash
cd rental_project
python manage.py makemigrations rental_app
python manage.py migrate
```

### 5. Create admin user (optional)

```bash
python manage.py createsuperuser
```

### 6. Start the server

```bash
python manage.py runserver
```

Server runs at **http://127.0.0.1:8000**

---

## API Endpoints

### Users
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| GET    | `/api/users/`         | List all users     |
| POST   | `/api/users/`         | Create user        |
| GET    | `/api/users/<id>/`    | Get user by ID     |
| PUT    | `/api/users/<id>/`    | Update user        |
| DELETE | `/api/users/<id>/`    | Delete user        |

### Properties
| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| GET    | `/api/properties/`        | List all properties   |
| POST   | `/api/properties/`        | Create property       |
| GET    | `/api/properties/<id>/`   | Get property by ID    |
| Params | `?city=Calgary&is_rented=true` | Filter             |

### Rental Listings
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/listings/`          | List all listings        |
| POST   | `/api/listings/`          | Create listing           |
| Params | `?status=Active&city=Calgary&min_price=1000&max_price=2000` | Filter |

### Appointments
| Method | Endpoint                            | Description        |
|--------|-------------------------------------|--------------------|
| GET    | `/api/appointments/`                | List appointments  |
| POST   | `/api/appointments/<id>/confirm/`   | Confirm            |
| POST   | `/api/appointments/<id>/cancel/`    | Cancel             |
| POST   | `/api/appointments/<id>/complete/`  | Complete           |
| Params | `?user_id=101&status=Pending`       | Filter             |

### Lease Records
| Method | Endpoint                | Description       |
|--------|-------------------------|--------------------|
| GET    | `/api/leases/`          | List leases        |
| Params | `?user_id=214`          | Filter by tenant   |

### Rent Payments
| Method | Endpoint                         | Description       |
|--------|----------------------------------|--------------------|
| GET    | `/api/payments/`                 | List payments      |
| POST   | `/api/payments/<id>/approve/`    | Approve payment    |
| Params | `?lease_id=9001&status=Pending`  | Filter             |

### Management Requests
| Method | Endpoint                          | Description        |
|--------|-----------------------------------|--------------------|
| GET    | `/api/requests/`                  | List requests      |
| POST   | `/api/requests/<id>/approve/`     | Approve request    |
| POST   | `/api/requests/<id>/reject/`      | Reject request     |
| POST   | `/api/requests/<id>/complete/`    | Complete request   |
| Params | `?user_id=214&status=Pending`     | Filter             |

---

## Models → DDL Mapping

| Django Model         | MySQL Table          | Primary Key  |
|----------------------|----------------------|--------------|
| `User`               | `USER`               | `UserID`     |
| `Property`           | `PROPERTY`           | `PropertyID` |
| `Appointment`        | `APPOINTMENT`        | `AppointID`  |
| `TimeSlot`           | `TIME_SLOT`          | `(AppointID, SlotNum)` |
| `LeaseRecord`        | `LEASE_RECORD`       | `LeaseID`    |
| `RentPayment`        | `RENT_PAYMENT`       | `PaytID`     |
| `ManagementRequest`  | `MANAGEMENT_REQUEST` | `RequestID`  |
| `RentalListing`      | `RENTAL_LISTING`     | `ListingID`  |
