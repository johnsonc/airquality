# admin.py
from leaflet.admin import LeafletGeoAdmin
from django.contrib import admin
from .models import AQDevice

admin.site.register(AQDevice, LeafletGeoAdmin)
