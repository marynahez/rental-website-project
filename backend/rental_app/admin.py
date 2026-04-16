from django.contrib import admin
from .models import (
    User, Property, Appointment, TimeSlot,
    LeaseRecord, RentPayment, ManagementRequest, RentalListing,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'first_name', 'last_name', 'email', 'user_type')
    list_filter = ('user_type',)
    search_fields = ('first_name', 'last_name', 'email')


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('property_id', 'street_name', 'city', 'province', 'post_code', 'is_rented')
    list_filter = ('city', 'province', 'is_rented')
    search_fields = ('street_name', 'city')


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('appointment_id', 'status', 'user')
    list_filter = ('status',)


class TimeSlotInline(admin.TabularInline):
    model = TimeSlot
    extra = 1


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ('appointment', 'slot_num', 'day', 'month', 'year')


@admin.register(LeaseRecord)
class LeaseRecordAdmin(admin.ModelAdmin):
    list_display = ('lease_id', 'user', 'property', 'start_date', 'end_date', 'monthly_rent')
    list_filter = ('start_date',)


@admin.register(RentPayment)
class RentPaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_id', 'pay_date', 'amount', 'method', 'status', 'lease')
    list_filter = ('status', 'method')


@admin.register(ManagementRequest)
class ManagementRequestAdmin(admin.ModelAdmin):
    list_display = ('request_id', 'date_submitted', 'status', 'permission', 'user', 'property')
    list_filter = ('status', 'permission')


@admin.register(RentalListing)
class RentalListingAdmin(admin.ModelAdmin):
    list_display = ('listing_id', 'price', 'status', 'date_posted', 'user', 'property')
    list_filter = ('status',)
    search_fields = ('description',)
