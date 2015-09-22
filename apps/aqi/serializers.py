from django.forms import widgets
from rest_framework import serializers
from rest_framework_gis import serializers as gs
from .models import AQDevice, AQFeed, City, State

class AQDeviceSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=512)
    title = serializers.CharField(max_length=512)
    url =  serializers.CharField(required=False, allow_blank=True,max_length=1024)
    imei = serializers.CharField(max_length=128)
    desc = serializers.CharField(required=False, allow_blank=True)
    lat = serializers.SerializerMethodField('getlat')
    lon = serializers.SerializerMethodField('getlon') 
    ip =  serializers.CharField(max_length=28, required=False, allow_blank=True)
    city =  serializers.CharField(max_length=512, required=False, allow_blank=True)
    state = serializers.CharField(max_length=128, required=False, allow_blank=True)
    geom = gs.GeometryField()
    created_on = serializers.DateTimeField(required=False)        

    def getlat(self, instance):
        return instance.geom['coordinates'][1]

    def getlon(self, instance):
        return instance.geom['coordinates'][0]

    def create(self, validated_data):
        """
        Create and return a new `AQDevice` instance, given the validated data.
        """
        return AQDevice.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Update and return an existing AQDevice instance, given the validated data.
        """
        instance.id = validated_data.get('id', instance.id)
        instance.title = validated_data.get('title', instance.title)
        instance.url = validated_data.get('url', instance.url)
        instance.imei = validated_data.get('imei', instance.imei)
        instance.desc = validated_data.get('desc', instance.desc)
        instance.lat = validated_data.get('lat', instance.lat)
        instance.lon = validated_data.get('lon', instance.lon)
        instance.ip = validated_data.get('ip', instance.ip)
        instance.city = validated_data.get('city', instance.city)
        instance.state = validated_data.get('state', instance.state)
        instance.geom = validated_data.get('geom', instance.geom)
        instance.created_on = validated_data.get('created_on', instance.created_on)
        instance.save()
        return instance


class AQFeedSerializer(serializers.ModelSerializer):
     class Meta:
         model = AQFeed
         fields = ('name','imei','created_on', 'humidity', 'temperature', 'pm10', 'pm25', 'count_large', 'count_small', 'lat', 'lon', 'ip', 'pm25conc', 'pm10conc', 'pm25count' , 'pm10count', 'pm25avg', 'pm10avg', 'pm25countavg', 'pm10countavg' )
#'PM25Conc', 'PM10Conc', 'PM25Count' , 'PM10Count', 'PM25avg', 'PM10avg', 'PM25Countavg', 'PM10Countavg' )

class StateSerializer(serializers.ModelSerializer):
     class Meta:
         model = State
         fields = ('id','name', 'lat', 'lon','live')


class CitySerializer(serializers.ModelSerializer):
     class Meta:
         model = City
         fields = ('id','name', 'lat', 'lon','live', 'stateID')

