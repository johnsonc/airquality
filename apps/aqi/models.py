from django.db import models
from djangotoolbox.fields import ListField, DictField
from djgeojson.fields import PointField
import datetime
from django_mongodb_engine.contrib import MongoDBManager

class AQDevice(models.Model):
    #simpleid = models.CharField(max_length=512)
    title = models.CharField(max_length=512)
    url =  models.TextField()
    imei = models.CharField(max_length=128)
    desc = models.TextField(null=True, blank=True)
    #lat =  models.CharField(max_length=24,  null=True, blank=True )
    #lon =  models.CharField(max_length=24, null=True, blank=True )
    geom = PointField()
    ip =  models.CharField(max_length=28, null=True, blank=True) # include IPv6
    city =  models.CharField(max_length=512, null=True, blank=True )
    state =  models.CharField(max_length=128, null=True, blank=True )
    created_on = models.DateTimeField(auto_now_add=True, null=True)
    notes =  models.CharField(max_length=512, null=True, blank=True )
    #live = models.BooleanField(null=True, blank=True )
    
    class Meta:
        ordering = ('created_on',)

    def __unicode__(self):
        return self.imei



class AQFeed(models.Model):
    name = models.CharField(max_length=128, null=True, blank=True )   
    imei = models.CharField(max_length=128)    
    humidity =  models.FloatField(null=True, blank=True )
    temperature =  models.FloatField(null=True, blank=True)
    pm10 =  models.FloatField(null=True, blank=True)
    pm25 =  models.FloatField(null=True, blank=True)
    count_large =  models.FloatField(null=True, blank=True)
    count_small =  models.FloatField(null=True, blank=True)    
    lat =  models.CharField(max_length=24,  null=True, blank=True)
    lon =  models.CharField(max_length=24, null=True, blank=True)
    ip =  models.CharField(max_length=28, null=True, blank=True) # include IPv6
    created_on = models.DateTimeField(blank=True, null=True)    
    objects = MongoDBManager()

    class Meta:
        ordering = ('-created_on',)

    def __unicode__(self):
        return self.imei


class State(models.Model):
    auto = models.AutoField(primary_key=True, blank=True )   
    id = models.IntegerField(null=True, blank=True)   
    name = models.CharField(max_length=128, null=True, blank=True )   
    lat =  models.CharField(max_length=24,  null=True, blank=True)
    lon =  models.CharField(max_length=24, null=True, blank=True)
    live =  models.CharField(max_length=8, null=True, blank=True, default='false')
    stateID = models.IntegerField(null=True, blank=True )   
    created_on = models.DateTimeField(auto_now_add=True, null=True)
    region_code = models.CharField(max_length=8, null=True, blank=True)
    #alternative_names = ListField(null=True, blank=True)    

    class Meta:
        ordering = ('created_on',)

    def __unicode__(self):
        return self.name



class City(models.Model):
    id = models.IntegerField(null=True,  blank=True )   
    name = models.CharField(max_length=128, null=True, blank=True )   
    lat =  models.CharField(max_length=24,  null=True, blank=True)
    lon =  models.CharField(max_length=24, null=True, blank=True)
    live =  models.CharField(max_length=8, null=True, blank=True, default='false')
    stateID = models.IntegerField(null=True, blank=True)   
    auto = models.AutoField(primary_key=True, blank=True )   
    created_on = models.DateTimeField(auto_now_add=True, null=True)
    
    class Meta:
        ordering = ('created_on',)
        
    def __unicode__(self):
        return self.name


