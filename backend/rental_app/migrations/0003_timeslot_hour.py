from django.db import migrations, models


class Migration(migrations.Migration):

    """
    Migration: adds hour field to TimeSlot in Database.

    Purpose:
    - enable hour-based appointment scheduling (day + hour instead of just day)
    """

    dependencies = [
        ('rental_app', '0002_alter_property_manager_alter_user_email'),
    ]

    operations = [
        migrations.AddField(
            model_name='timeslot',
            name='hour',
            field=models.IntegerField(db_column='Hour', default=0),
        ),
    ]
