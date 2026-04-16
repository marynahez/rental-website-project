from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction

from .models import (
    User, Property, Appointment, TimeSlot,
    LeaseRecord, RentPayment, ManagementRequest, RentalListing,
)
from .serializers import (
    UserSerializer, PropertySerializer,
    AppointmentSerializer, AppointmentCreateSerializer,
    TimeSlotSerializer, LeaseRecordSerializer,
    RentPaymentSerializer, ManagementRequestSerializer,
    RentalListingSerializer,
)


# ─── User ─────────────────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'user_type']


# ─── Property ─────────────────────────────────────────────────────

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer

    def get_queryset(self):
        qs = super().get_queryset()
        manager_id = self.request.query_params.get('manager_id')
        city        = self.request.query_params.get('city')
        province    = self.request.query_params.get('province')
        is_rented   = self.request.query_params.get('is_rented')

        if manager_id:
            qs = qs.filter(manager_id=manager_id)
        if city:
            qs = qs.filter(city__icontains=city)
        if province:
            qs = qs.filter(province__icontains=province)
        if is_rented is not None and is_rented != '':
            qs = qs.filter(is_rented=is_rented.lower() == 'true')
        return qs


# ─── Appointment ──────────────────────────────────────────────────

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = (
        Appointment.objects
        .select_related('user', 'listing', 'listing__property')
        .prefetch_related('time_slots')
        .all()
    )
    serializer_class = AppointmentSerializer

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update', 'book']:
            return AppointmentCreateSerializer
        return AppointmentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user_id     = self.request.query_params.get('user_id')
        appt_status = self.request.query_params.get('status')
        manager_id  = self.request.query_params.get('manager_id')

        if user_id:
            qs = qs.filter(user_id=user_id)
        if appt_status:
            qs = qs.filter(status=appt_status)
        # Manager sees only appointments linked to their listings
        if manager_id:
            qs = qs.filter(listing__user_id=manager_id)
        return qs

    @action(detail=False, methods=['post'])
    def book(self, request):
        """
        Atomic booking with duplicate-slot check.
        Body: { user, listing, year, month, day }
        Returns 409 if that listing already has a Pending/Confirmed appt on that date.
        """
        user_id  = request.data.get('user')
        listing_id = request.data.get('listing')
        year  = int(request.data.get('year', 0))
        month = int(request.data.get('month', 0))
        day   = int(request.data.get('day', 0))

        if not all([user_id, listing_id, year, month, day]):
            return Response({'detail': 'Missing required fields.'}, status=status.HTTP_400_BAD_REQUEST)

        # Duplicate slot check: same listing, same date, not cancelled
        conflict = (
            TimeSlot.objects
            .filter(
                day=day, month=month, year=year,
                appointment__listing_id=listing_id,
            )
            .exclude(appointment__status=Appointment.Status.CANCELLED)
            .exists()
        )
        if conflict:
            return Response(
                {'detail': 'This listing is already booked for that date. Please choose another day.'},
                status=status.HTTP_409_CONFLICT,
            )

        with transaction.atomic():
            appt = Appointment.objects.create(
                status=Appointment.Status.PENDING,
                user_id=user_id,
                listing_id=listing_id,
            )
            slot_num = TimeSlot.objects.filter(appointment=appt).count() + 1
            TimeSlot.objects.create(
                appointment=appt,
                slot_num=slot_num,
                day=day, month=month, year=year,
            )

        serializer = AppointmentSerializer(appt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        appt = self.get_object()
        appt.status = Appointment.Status.CONFIRMED
        appt.save()
        return Response({'status': 'Appointment confirmed'})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        appt = self.get_object()
        appt.status = Appointment.Status.CANCELLED
        appt.save()
        return Response({'status': 'Appointment cancelled'})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        appt = self.get_object()
        appt.status = Appointment.Status.COMPLETED
        appt.save()
        return Response({'status': 'Appointment completed'})


# ─── TimeSlot ─────────────────────────────────────────────────────

class TimeSlotViewSet(viewsets.ModelViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        appt_id = self.request.query_params.get('appointment_id')
        if appt_id:
            qs = qs.filter(appointment_id=appt_id)
        return qs


# ─── Lease Record ─────────────────────────────────────────────────

class LeaseRecordViewSet(viewsets.ModelViewSet):
    queryset = LeaseRecord.objects.select_related('user', 'property').all()
    serializer_class = LeaseRecordSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user_id     = self.request.query_params.get('user_id')
        property_id = self.request.query_params.get('property_id')
        manager_id  = self.request.query_params.get('manager_id')

        if user_id:
            qs = qs.filter(user_id=user_id)
        if property_id:
            qs = qs.filter(property_id=property_id)
        # Manager sees only leases for their properties
        if manager_id:
            qs = qs.filter(property__manager_id=manager_id)
        return qs


# ─── Rent Payment ─────────────────────────────────────────────────

class RentPaymentViewSet(viewsets.ModelViewSet):
    queryset = RentPayment.objects.select_related('lease', 'lease__property').all()
    serializer_class = RentPaymentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        lease_id   = self.request.query_params.get('lease_id')
        pay_status = self.request.query_params.get('status')
        manager_id = self.request.query_params.get('manager_id')

        if lease_id:
            qs = qs.filter(lease_id=lease_id)
        if pay_status:
            qs = qs.filter(status=pay_status)
        # Manager sees only payments for leases on their properties
        if manager_id:
            qs = qs.filter(lease__property__manager_id=manager_id)
        return qs

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        payment = self.get_object()
        payment.status = RentPayment.Status.COMPLETED
        payment.save()
        return Response({'status': 'Payment approved'})

    @action(detail=True, methods=['post'])
    def fail(self, request, pk=None):
        payment = self.get_object()
        payment.status = RentPayment.Status.FAILED
        payment.save()
        return Response({'status': 'Payment marked as failed'})


# ─── Management Request ──────────────────────────────────────────

class ManagementRequestViewSet(viewsets.ModelViewSet):
    queryset = ManagementRequest.objects.select_related('user', 'property', 'property__manager').all()
    serializer_class = ManagementRequestSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user_id     = self.request.query_params.get('user_id')
        req_status  = self.request.query_params.get('status')
        property_id = self.request.query_params.get('property_id')
        manager_id  = self.request.query_params.get('manager_id')

        if user_id:
            qs = qs.filter(user_id=user_id)
        if req_status:
            qs = qs.filter(status=req_status)
        if property_id:
            qs = qs.filter(property_id=property_id)
        # Manager sees only requests for their properties
        if manager_id:
            qs = qs.filter(property__manager_id=manager_id)
        return qs

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        req = self.get_object()
        req.status = ManagementRequest.Status.APPROVED
        req.permission = ManagementRequest.Permission.GRANTED
        req.save()
        return Response({'status': 'Request approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        req = self.get_object()
        req.status = ManagementRequest.Status.REJECTED
        req.permission = ManagementRequest.Permission.DENIED
        req.save()
        return Response({'status': 'Request rejected'})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        req = self.get_object()
        req.status = ManagementRequest.Status.COMPLETED
        req.save()
        return Response({'status': 'Request completed'})


# ─── Rental Listing ───────────────────────────────────────────────

class RentalListingViewSet(viewsets.ModelViewSet):
    queryset = RentalListing.objects.select_related('user', 'property').all()
    serializer_class = RentalListingSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        listing_status = self.request.query_params.get('status')
        city       = self.request.query_params.get('city')
        province   = self.request.query_params.get('province')
        min_price  = self.request.query_params.get('min_price')
        max_price  = self.request.query_params.get('max_price')
        manager_id = self.request.query_params.get('manager_id')

        if listing_status:
            qs = qs.filter(status=listing_status)
        if city:
            qs = qs.filter(property__city__icontains=city)
        if province:
            qs = qs.filter(property__province__icontains=province)
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        if manager_id:
            qs = qs.filter(user_id=manager_id)
        return qs
