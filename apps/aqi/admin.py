# admin.py
from leaflet.admin import LeafletGeoAdmin
from django.contrib import admin
from .models import AQDevice, AQFeed, City, State

admin.site.register(AQDevice, LeafletGeoAdmin)
admin.site.register(City, LeafletGeoAdmin)
admin.site.register(State, LeafletGeoAdmin)
admin.site.register(AQFeed, LeafletGeoAdmin)
