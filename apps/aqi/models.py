from django.db import models
from djangotoolbox.fields import ListField, DictField
from djgeojson.fields import PointField
import datetime

class AQDevice(models.Model):
    #simpleid = models.CharField(max_length=512)
    title = models.CharField(max_length=512)
    url =  models.TextField()
    imei = models.CharField(max_length=128)
    desc = models.TextField(null=True, blank=True)
    lat =  models.CharField(max_length=24,  null=True, blank=True )
    lon =  models.CharField(max_length=24, null=True, blank=True )
    geom = PointField()
    created_on = models.DateTimeField(auto_now_add=True, null=True)
    notes =  models.CharField(max_length=512, null=True, blank=True )
    
    class Meta:
        ordering = ('created_on',)


class AQFeed(models.Model):
    name = models.CharField(max_length=128)    
    imei = models.CharField(max_length=128)    
    humidity =  models.FloatField(null=True, blank=True )
    temperature =  models.FloatField(null=True, blank=True)
    pm10 =  models.FloatField(null=True, blank=True)
    pm25 =  models.FloatField(null=True, blank=True)
    count_large =  models.FloatField(null=True, blank=True)
    count_small =  models.FloatField(null=True, blank=True)    
    lat =  models.CharField(max_length=24,  null=True, blank=True)
    lon =  models.CharField(max_length=24, null=True, blank=True)
    created_on = models.DateTimeField(blank=True, null=True)    

    class Meta:
        ordering = ('created_on',)
