from django.core.management.base import BaseCommand
from rental_app.models import (
    User, Property, Appointment, TimeSlot,
    LeaseRecord, RentPayment, ManagementRequest, RentalListing,
)
from datetime import date


class Command(BaseCommand):
    help = 'Load exact project data into the database'
й
    def handle(self, *args, **kwargs):
        self.stdout.write('Clearing existing data...')
        RentPayment.objects.all().delete()
        ManagementRequest.objects.all().delete()
        RentalListing.objects.all().delete()
        LeaseRecord.objects.all().delete()
        TimeSlot.objects.all().delete()
        Appointment.objects.all().delete()
        Property.objects.all().delete()
        User.objects.all().delete()

        # ── USERS ─────────────────────────────────────────────────────
        self.stdout.write('Creating users...')
        User.objects.create(user_id=367, first_name='Priya',  last_name='Sandhu', email='priya.sandhu.pm@urbanlane.ca',    user_type='PropertyManager')
        User.objects.create(user_id=214, first_name='Ethan',  last_name='Vale',   email='ethan.vale.rent@maplehub.ca',     user_type='Tenant')
        User.objects.create(user_id=101, first_name='Mila',   last_name='Kovren', email='mila.kovren27@northmail.ca',      user_type='ProspectiveRenter')
        User.objects.create(user_id=402, first_name='James',  last_name='Chen',   email='james.chen@rentview.ca',          user_type='ProspectiveRenter')
        User.objects.create(user_id=510, first_name='Olivia', last_name='Park',   email='olivia.park@homely.ca',           user_type='Tenant')
        User.objects.create(user_id=603, first_name='Lucas',  last_name='Kim',    email='lucas.kim@calgaryhome.ca',        user_type='ProspectiveRenter')
        User.objects.create(user_id=715, first_name='Sarah',  last_name='Ahmed',  email='sarah.ahmed@rentease.ca',         user_type='Tenant')
        User.objects.create(user_id=820, first_name='David',  last_name='Morin',  email='david.morin@pmgroup.ca',          user_type='PropertyManager')
        User.objects.create(user_id=901, first_name='Emma',   last_name='Nowak',  email='emma.nowak@viewrent.ca',          user_type='ProspectiveRenter')

        # ── PROPERTIES ────────────────────────────────────────────────
        self.stdout.write('Creating properties...')
        Property.objects.create(property_id=6384, province='British Columbia', city='Vancouver', street_name='West 8th Avenue',   post_code='V6H 2W6', suite=None,        apartment='302', is_rented=False)
        Property.objects.create(property_id=5021, province='Alberta',          city='Calgary',   street_name='Evanston View NW',  post_code='T3P 0H5', suite='Unit 12',   apartment='A',   is_rented=True)
        Property.objects.create(property_id=7912, province='Manitoba',         city='Winnipeg',  street_name='Bank Street',       post_code='R3C 1A5', suite='Suite 5B',  apartment='55',  is_rented=True)
        Property.objects.create(property_id=8101, province='Alberta',          city='Calgary',   street_name='17th Ave SW',         post_code='T2S 0A5', suite='Unit 4',    apartment='B',   is_rented=False)
        Property.objects.create(property_id=8205, province='Alberta',          city='Edmonton',  street_name='Jasper Avenue',       post_code='T5J 1S9', suite='Suite 12A', apartment='120', is_rented=True)
        Property.objects.create(property_id=9010, province='Ontario',          city='Toronto',   street_name='Queen Street W',      post_code='M5V 2A1', suite='Unit 8',    apartment='C',   is_rented=False)
        Property.objects.create(property_id=9101, province='Ontario',          city='Ottawa',    street_name='Rideau Street',       post_code='K1N 5Y1', suite='Suite 3B',  apartment='310', is_rented=False)
        Property.objects.create(property_id=9202, province='Nova Scotia',      city='Halifax',   street_name='Spring Garden Road',  post_code='B3J 1G8', suite=None,        apartment='204', is_rented=False)
        Property.objects.create(property_id=9303, province='British Columbia', city='Victoria',  street_name='Wharf Street',        post_code='V8W 1T3', suite='Suite 5',   apartment='501', is_rented=False)
        Property.objects.create(property_id=9404, province='Saskatchewan',     city='Saskatoon', street_name='Broadway Avenue',     post_code='S7N 1B6', suite=None,        apartment='12',  is_rented=False)
        Property.objects.create(property_id=9505, province='Quebec',           city='Montreal',  street_name='St-Laurent Boulevard',post_code='H2X 2S9', suite='Apt 2',     apartment='2',   is_rented=False)
        Property.objects.create(property_id=9606, province='Ontario',          city='Hamilton',  street_name='Locke Street S',      post_code='L8P 4B8', suite=None,        apartment='7',   is_rented=False)
        Property.objects.create(property_id=9707, province='British Columbia', city='Kelowna',   street_name='Pandosy Street',      post_code='V1Y 1W3', suite='Unit 15',   apartment='B',   is_rented=False)
        Property.objects.create(property_id=9808, province='Saskatchewan',     city='Regina',    street_name='College Avenue',      post_code='S4T 1W1', suite=None,        apartment='4',   is_rented=False)

        # ── APPOINTMENTS ──────────────────────────────────────────────
        self.stdout.write('Creating appointments...')
        a1 = Appointment.objects.create(appointment_id=4107, status='Pending',   user_id=101)
        a2 = Appointment.objects.create(appointment_id=5284, status='Confirmed', user_id=214)
        a3 = Appointment.objects.create(appointment_id=6739, status='Completed', user_id=367)

        # ── TIME SLOTS ────────────────────────────────────────────────
        self.stdout.write('Creating time slots...')
        TimeSlot.objects.create(appointment=a1, slot_num=1, day=18, month=3, year=2026)
        TimeSlot.objects.create(appointment=a2, slot_num=1, day=20, month=3, year=2026)
        TimeSlot.objects.create(appointment=a3, slot_num=1, day=12, month=3, year=2026)

        # ── LEASE RECORDS ─────────────────────────────────────────────
        self.stdout.write('Creating leases...')
        l1 = LeaseRecord.objects.create(lease_id=9001, start_date=date(2026,1,1),  end_date=date(2026,12,31), security_deposit=1200.00, monthly_rent=1850.00, user_id=214, property_id=7912)
        l2 = LeaseRecord.objects.create(lease_id=9002, start_date=date(2026,4,1),  end_date=date(2027,3,31),  security_deposit=1000.00, monthly_rent=1600.00, user_id=214, property_id=5021)
        l3 = LeaseRecord.objects.create(lease_id=9003, start_date=date(2025,9,1),  end_date=date(2026,8,31),  security_deposit=1500.00, monthly_rent=2100.00, user_id=510, property_id=8205)

        # ── RENT PAYMENTS ─────────────────────────────────────────────
        self.stdout.write('Creating payments...')
        RentPayment.objects.create(payment_id=30011, pay_date=date(2026,1,3),  amount=1850.00, method='Transfer',   status='Completed', lease=l1)
        RentPayment.objects.create(payment_id=30027, pay_date=date(2026,2,3),  amount=1850.00, method='DebitCard',  status='Completed', lease=l1)
        RentPayment.objects.create(payment_id=30045, pay_date=date(2026,4,2),  amount=1600.00, method='CreditCard', status='Pending',   lease=l2)
        RentPayment.objects.create(payment_id=30060, pay_date=date(2026,3,1),  amount=2100.00, method='Transfer',   status='Completed', lease=l3)

        # ── MANAGEMENT REQUESTS ───────────────────────────────────────
        self.stdout.write('Creating management requests...')
        ManagementRequest.objects.create(request_id=7101, date_submitted=date(2026,3,5),  status='Pending',   permission='Pending', description='Mold has appeared on the bathroom ceiling and needs inspection.',                  user_id=214, property_id=7912)
        ManagementRequest.objects.create(request_id=7248, date_submitted=date(2026,3,7),  status='Approved',  permission='Granted', description='We will be away from home for about a month and wanted to inform you in advance.', user_id=214, property_id=5021)
        ManagementRequest.objects.create(request_id=7390, date_submitted=date(2026,3,12), status='Completed', permission='Granted', description='The washing machine is not working and may require repair.',                        user_id=214, property_id=7912)
        ManagementRequest.objects.create(request_id=7450, date_submitted=date(2026,4,1),  status='Pending',   permission='Pending', description='Heating system making loud noises at night please inspect.',                       user_id=510, property_id=8205)

        # ── RENTAL LISTINGS ───────────────────────────────────────────
        self.stdout.write('Creating listings...')
        RentalListing.objects.create(listing_id=8105, price=1600.00, description='Cozy 1-bedroom near Calgary\'s C-Train with a sunny balcony and quick access to downtown. Heat and water included.',                                                                          date_posted=date(2026,2,20),  status='Active',   user_id=367, property_id=5021)
        RentalListing.objects.create(listing_id=8261, price=1850.00, description='Spacious 3-bedroom in Winnipeg\'s Exchange District. Two outdoor parking stalls, in-suite laundry, and a quiet tree-lined street.',                                                             date_posted=date(2025,12,15), status='Rented',   user_id=367, property_id=7912)
        RentalListing.objects.create(listing_id=8344, price=1450.00, description='Bright 2-bedroom in Vancouver\'s West Side. Hardwood floors, large windows, and a short walk to Kitsilano Beach.',                                                                              date_posted=date(2026,1,30),  status='Inactive', user_id=367, property_id=6384)
        RentalListing.objects.create(listing_id=8400, price=1750.00, description='Modern 2-bedroom on Calgary\'s trendy 17th Ave SW. Steps from boutique shops, cafes, and the Red Mile. Bike storage included.',                                                                 date_posted=date(2026,3,1),   status='Active',   user_id=367, property_id=8101)
        RentalListing.objects.create(listing_id=8455, price=2100.00, description='Upscale 2-bedroom in downtown Edmonton\'s Ice District. Floor-to-ceiling windows, building gym, rooftop terrace, and concierge service.',                                                       date_posted=date(2026,3,10),  status='Active',   user_id=820, property_id=8205)
        RentalListing.objects.create(listing_id=8500, price=2400.00, description='Bright corner unit steps from Queen Street West in Toronto. Open-concept layout, exposed brick, and TTC at your door. Perfect for young professionals.',                                        date_posted=date(2026,3,15),  status='Active',   user_id=820, property_id=9010)
        # New Canadian listings
        RentalListing.objects.create(listing_id=8601, price=1975.00, description='Charming 2-bedroom near Ottawa\'s ByWard Market. Minutes from Parliament Hill, the Rideau Canal, and the LRT. All utilities included.',                                                        date_posted=date(2026,3,18),  status='Active',   user_id=820, property_id=9101)
        RentalListing.objects.create(listing_id=8702, price=1525.00, description='Affordable 1-bedroom in Halifax\'s South End. Steps from Spring Garden Road, the Public Gardens, and the Halifax Seaport. Heat and hot water included.',                                       date_posted=date(2026,3,22),  status='Active',   user_id=367, property_id=9202)
        RentalListing.objects.create(listing_id=8803, price=2650.00, description='Luxury waterfront suite in Victoria\'s Inner Harbour. Stunning ocean views, underground parking, rooftop patio, and walking distance to the BC Legislature.',                                   date_posted=date(2026,3,25),  status='Active',   user_id=820, property_id=9303)
        RentalListing.objects.create(listing_id=8904, price=1300.00, description='Cozy 1-bedroom in Saskatoon\'s Broadway District. Walkable neighbourhood with local restaurants, the Mendel Art Gallery, and the South Saskatchewan River nearby.',                            date_posted=date(2026,3,28),  status='Active',   user_id=367, property_id=9404)
        RentalListing.objects.create(listing_id=9005, price=1850.00, description='Stylish 2-bedroom in Montreal\'s Plateau-Mont-Royal. High ceilings, exposed brick, steps from St-Laurent Blvd and the best brunch spots in the city. Partially furnished.',                   date_posted=date(2026,4,1),   status='Active',   user_id=820, property_id=9505)
        RentalListing.objects.create(listing_id=9106, price=1425.00, description='Quiet 2-bedroom in Hamilton\'s Locke Street neighbourhood. Updated kitchen, private backyard, and a 10-minute GO Train commute to downtown Toronto.',                                           date_posted=date(2026,4,3),   status='Active',   user_id=367, property_id=9606)
        RentalListing.objects.create(listing_id=9207, price=2200.00, description='Modern loft in Kelowna\'s South Pandosy Village. Lake Okanagan views, rooftop patio, two underground parking spots, and steps from the best wineries in BC.',                                  date_posted=date(2026,4,5),   status='Active',   user_id=820, property_id=9707)
        RentalListing.objects.create(listing_id=9308, price=1650.00, description='Renovated 2-bedroom in Regina\'s Cathedral neighbourhood. Original hardwood, covered deck, detached garage, and a short commute to the University of Regina.',                                  date_posted=date(2026,4,7),   status='Active',   user_id=367, property_id=9808)

        self.stdout.write(self.style.SUCCESS('\n✓ Data loaded successfully'))
        self.stdout.write(f'  Users:               {User.objects.count()}')
        self.stdout.write(f'  Properties:          {Property.objects.count()}')
        self.stdout.write(f'  Appointments:        {Appointment.objects.count()}')
        self.stdout.write(f'  Time Slots:          {TimeSlot.objects.count()}')
        self.stdout.write(f'  Leases:              {LeaseRecord.objects.count()}')
        self.stdout.write(f'  Payments:            {RentPayment.objects.count()}')
        self.stdout.write(f'  Management Requests: {ManagementRequest.objects.count()}')
        self.stdout.write(f'  Listings:            {RentalListing.objects.count()}')
