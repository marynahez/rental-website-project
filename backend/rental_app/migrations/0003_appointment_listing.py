from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('rental_app', '0002_property_manager'),
    ]

    operations = [
        migrations.AddField(
            model_name='appointment',
            name='listing',
            field=models.ForeignKey(
                blank=True,
                db_column='ListingID',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='appointments',
                to='rental_app.rentallisting',
            ),
        ),
    ]
