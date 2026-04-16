from django.db import models


class User(models.Model):
    """
    Represents all system users: ProspectiveRenter, Tenant, PropertyManager.
    Maps to the USER table in the DDL.
    """

    class UserType(models.TextChoices):
        PROSPECTIVE_RENTER = 'ProspectiveRenter', 'Prospective Renter'
        TENANT = 'Tenant', 'Tenant'
        PROPERTY_MANAGER = 'PropertyManager', 'Property Manager'

    user_id = models.AutoField(primary_key=True, db_column='UserID')
    first_name = models.CharField(max_length=50, db_column='FName')
    last_name = models.CharField(max_length=50, db_column='LName')
    email = models.EmailField(max_length=100, unique=True, db_column='Email')
    user_type = models.CharField(
        max_length=20,
        choices=UserType.choices,
        db_column='UserType',
    )

    class Meta:
        db_table = 'USER'

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.user_type})"


class Property(models.Model):
    """
    Represents a rental property with address details and rental status.
    Maps to the PROPERTY table in the DDL.
    """

    property_id = models.AutoField(primary_key=True, db_column='PropertyID')
    province = models.CharField(max_length=50, db_column='Province')
    city = models.CharField(max_length=50, db_column='City')
    street_name = models.CharField(max_length=100, db_column='StName')
    post_code = models.CharField(max_length=20, db_column='PostCode')
    suite = models.CharField(max_length=20, blank=True, null=True, db_column='Suite')
    apartment = models.CharField(max_length=20, db_column='Appart')
    is_rented = models.BooleanField(default=False, db_column='IsRented')

    manager = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_column='ManagerID',
        related_name='managed_properties',
        limit_choices_to={'user_type': User.UserType.PROPERTY_MANAGER},
        null=True,
        blank=True,
    )

    class Meta:
        db_table = 'PROPERTY'
        verbose_name_plural = 'Properties'

    def __str__(self):
        return f"{self.street_name}, {self.city} ({'Rented' if self.is_rented else 'Available'})"


class Appointment(models.Model):
    """
    Represents a viewing appointment booked by a prospective renter.
    Maps to the APPOINTMENT table in the DDL.
    """

    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        CONFIRMED = 'Confirmed', 'Confirmed'
        CANCELLED = 'Cancelled', 'Cancelled'
        COMPLETED = 'Completed', 'Completed'

    appointment_id = models.AutoField(primary_key=True, db_column='AppointID')
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        db_column='Status',
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_column='UserID',
        related_name='appointments',
    )
    listing = models.ForeignKey(
        'RentalListing',
        on_delete=models.SET_NULL,
        db_column='ListingID',
        related_name='appointments',
        null=True,
        blank=True,
    )

    class Meta:
        db_table = 'APPOINTMENT'

    def __str__(self):
        return f"Appointment #{self.appointment_id} — {self.status}"


class TimeSlot(models.Model):
    """
    Represents a specific time slot within an appointment.
    Composite PK: (AppointID, SlotNum).
    Maps to the TIME_SLOT table in the DDL.
    """

    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        db_column='AppointID',
        related_name='time_slots',
    )
    slot_num = models.IntegerField(db_column='SlotNum')
    day = models.IntegerField(db_column='Day')
    month = models.IntegerField(db_column='Month')
    year = models.IntegerField(db_column='Year')

    class Meta:
        db_table = 'TIME_SLOT'
        unique_together = ('appointment', 'slot_num')

    def __str__(self):
        return f"Slot {self.slot_num} — {self.year}-{self.month:02d}-{self.day:02d}"


class LeaseRecord(models.Model):
    """
    Represents a lease agreement between a tenant and a property.
    Maps to the LEASE_RECORD table in the DDL.
    """

    lease_id = models.AutoField(primary_key=True, db_column='LeaseID')
    start_date = models.DateField(db_column='StartDate')
    end_date = models.DateField(db_column='EndDate')
    security_deposit = models.DecimalField(
        max_digits=7, decimal_places=2, db_column='SecurityDep',
    )
    monthly_rent = models.DecimalField(
        max_digits=7, decimal_places=2, db_column='MonthlyRent',
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_column='UserID',
        related_name='lease_records',
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        db_column='PropertyID',
        related_name='lease_records',
    )

    class Meta:
        db_table = 'LEASE_RECORD'

    def __str__(self):
        return f"Lease #{self.lease_id} — {self.user} @ {self.property}"


class RentPayment(models.Model):
    """
    Represents a rent payment linked to a lease record.
    Maps to the RENT_PAYMENT table in the DDL.
    """

    class Method(models.TextChoices):
        CASH = 'Cash', 'Cash'
        CREDIT_CARD = 'CreditCard', 'Credit Card'
        DEBIT_CARD = 'DebitCard', 'Debit Card'
        TRANSFER = 'Transfer', 'Transfer'

    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        COMPLETED = 'Completed', 'Completed'
        FAILED = 'Failed', 'Failed'

    payment_id = models.AutoField(primary_key=True, db_column='PaytID')
    pay_date = models.DateField(db_column='PayDate')
    amount = models.DecimalField(
        max_digits=7, decimal_places=2, db_column='Amount',
    )
    method = models.CharField(
        max_length=10,
        choices=Method.choices,
        db_column='Method',
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        db_column='Status',
    )
    lease = models.ForeignKey(
        LeaseRecord,
        on_delete=models.CASCADE,
        db_column='LeaseID',
        related_name='payments',
    )

    class Meta:
        db_table = 'RENT_PAYMENT'

    def __str__(self):
        return f"Payment #{self.payment_id} — ${self.amount} ({self.status})"


class ManagementRequest(models.Model):
    """
    Represents a maintenance/management request submitted by a tenant.
    Maps to the MANAGEMENT_REQUEST table in the DDL.
    """

    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        APPROVED = 'Approved', 'Approved'
        REJECTED = 'Rejected', 'Rejected'
        COMPLETED = 'Completed', 'Completed'

    class Permission(models.TextChoices):
        GRANTED = 'Granted', 'Granted'
        DENIED = 'Denied', 'Denied'
        PENDING = 'Pending', 'Pending'

    request_id = models.AutoField(primary_key=True, db_column='RequestID')
    date_submitted = models.DateField(db_column='DateSubm')
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        db_column='Status',
    )
    permission = models.CharField(
        max_length=10,
        choices=Permission.choices,
        default=Permission.PENDING,
        db_column='Permission',
    )
    description = models.TextField(db_column='Description')
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_column='UserID',
        related_name='management_requests',
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        db_column='PropertyID',
        related_name='management_requests',
    )

    class Meta:
        db_table = 'MANAGEMENT_REQUEST'

    def __str__(self):
        return f"Request #{self.request_id} — {self.status}"


class RentalListing(models.Model):
    """
    Represents a rental listing posted by a property manager.
    Maps to the RENTAL_LISTING table in the DDL.
    """

    class Status(models.TextChoices):
        ACTIVE = 'Active', 'Active'
        INACTIVE = 'Inactive', 'Inactive'
        RENTED = 'Rented', 'Rented'
        CLOSED = 'Closed', 'Closed'

    listing_id = models.AutoField(primary_key=True, db_column='ListingID')
    price = models.DecimalField(
        max_digits=7, decimal_places=2, db_column='Price',
    )
    description = models.TextField(db_column='Description')
    date_posted = models.DateField(db_column='DatePosted')
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_column='Status',
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_column='UserID',
        related_name='rental_listings',
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        db_column='PropertyID',
        related_name='rental_listings',
    )

    class Meta:
        db_table = 'RENTAL_LISTING'

    def __str__(self):
        return f"Listing #{self.listing_id} — ${self.price}/mo ({self.status})"
