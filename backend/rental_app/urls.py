from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'properties', views.PropertyViewSet)
router.register(r'appointments', views.AppointmentViewSet)
router.register(r'timeslots', views.TimeSlotViewSet)
router.register(r'leases', views.LeaseRecordViewSet)
router.register(r'payments', views.RentPaymentViewSet)
router.register(r'requests', views.ManagementRequestViewSet)
router.register(r'listings', views.RentalListingViewSet)

# ─── API Endpoints ────────────────────────────────────────────────
#
# Users:
#   GET/POST       /api/users/
#   GET/PUT/DELETE  /api/users/<id>/
#
# Properties:
#   GET/POST       /api/properties/
#   GET/PUT/DELETE  /api/properties/<id>/
#   Query params:  ?city=Calgary&province=Alberta&is_rented=true
#
# Appointments:
#   GET/POST       /api/appointments/
#   GET/PUT/DELETE  /api/appointments/<id>/
#   POST           /api/appointments/<id>/confirm/
#   POST           /api/appointments/<id>/cancel/
#   POST           /api/appointments/<id>/complete/
#   Query params:  ?user_id=101&status=Pending
#
# Time Slots:
#   GET/POST       /api/timeslots/
#   GET/PUT/DELETE  /api/timeslots/<id>/
#   Query params:  ?appointment_id=4107
#
# Lease Records:
#   GET/POST       /api/leases/
#   GET/PUT/DELETE  /api/leases/<id>/
#   Query params:  ?user_id=214&property_id=7912
#
# Rent Payments:
#   GET/POST       /api/payments/
#   GET/PUT/DELETE  /api/payments/<id>/
#   POST           /api/payments/<id>/approve/
#   Query params:  ?lease_id=9001&status=Pending
#
# Management Requests:
#   GET/POST       /api/requests/
#   GET/PUT/DELETE  /api/requests/<id>/
#   POST           /api/requests/<id>/approve/
#   POST           /api/requests/<id>/reject/
#   POST           /api/requests/<id>/complete/
#   Query params:  ?user_id=214&status=Pending&property_id=7912
#
# Rental Listings:
#   GET/POST       /api/listings/
#   GET/PUT/DELETE  /api/listings/<id>/
#   Query params:  ?status=Active&city=Calgary&min_price=1000&max_price=2000&search=cozy

urlpatterns = [
    path('api/', include(router.urls)),
]
