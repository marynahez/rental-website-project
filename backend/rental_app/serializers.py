from rest_framework import serializers
from .models import (
    User, Property, Appointment, TimeSlot,
    LeaseRecord, RentPayment, ManagementRequest, RentalListing,
)
from rest_framework.validators import UniqueTogetherValidator


# ─── User ─────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'first_name', 'last_name', 'email', 'user_type']


# ─── Property ─────────────────────────────────────────────────────

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = '__all__'
        validators = [
            UniqueTogetherValidator(
                queryset=Property.objects.all(),
                fields=[
                    'street_name',
                    'city',
                    'province',
                    'post_code',
                    'suite',
                    'apartment',
                ],
                message="A property with the same address and unit already exists."
            )
        ]

# ─── TimeSlot (nested inside Appointment) ─────────────────────────

class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ['appointment', 'slot_num', 'day', 'month', 'year', 'hour']


# ─── Appointment ──────────────────────────────────────────────────

class AppointmentSerializer(serializers.ModelSerializer):
    time_slots = TimeSlotSerializer(many=True, read_only=True)
    user_name = serializers.SerializerMethodField()
    property_address = serializers.SerializerMethodField()
    listing_price = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'appointment_id', 'status', 'user', 'user_name',
            'listing', 'property_address', 'listing_price',
            'time_slots',
        ]

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def get_property_address(self, obj):
        if obj.listing and obj.listing.property:
            p = obj.listing.property
            return f"{p.street_name}, {p.city}"
        return None

    def get_listing_price(self, obj):
        if obj.listing:
            return str(obj.listing.price)
        return None


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Used for creating/updating appointments (without nested read-only fields)."""

    class Meta:
        model = Appointment
        fields = ['appointment_id', 'status', 'user', 'listing']


# ─── Lease Record ─────────────────────────────────────────────────

class LeaseRecordSerializer(serializers.ModelSerializer):
    tenant_name = serializers.SerializerMethodField()
    property_address = serializers.SerializerMethodField()

    class Meta:
        model = LeaseRecord
        fields = [
            'lease_id', 'start_date', 'end_date', 'security_deposit',
            'monthly_rent', 'user', 'tenant_name', 'property',
            'property_address',
        ]

    def get_tenant_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def get_property_address(self, obj):
        p = obj.property
        return f"{p.street_name}, {p.city}, {p.province}"


# ─── Rent Payment ─────────────────────────────────────────────────

class RentPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentPayment
        fields = [
            'payment_id', 'pay_date', 'amount', 'method',
            'status', 'lease',
        ]


# ─── Management Request ──────────────────────────────────────────

class ManagementRequestSerializer(serializers.ModelSerializer):
    tenant_name = serializers.SerializerMethodField()
    property_address = serializers.SerializerMethodField()

    class Meta:
        model = ManagementRequest
        fields = [
            'request_id', 'date_submitted', 'status', 'permission',
            'description', 'user', 'tenant_name', 'property',
            'property_address',
        ]

    def get_tenant_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def get_property_address(self, obj):
        p = obj.property
        return f"{p.street_name}, {p.city}"


# ─── Rental Listing ───────────────────────────────────────────────

class RentalListingSerializer(serializers.ModelSerializer):
    manager_name = serializers.SerializerMethodField()
    property_details = PropertySerializer(source='property', read_only=True)

    class Meta:
        model = RentalListing
        fields = [
            'listing_id', 'price', 'description', 'date_posted',
            'status', 'user', 'manager_name', 'property',
            'property_details',
        ]

    def get_manager_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
