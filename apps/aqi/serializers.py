from django.forms import widgets
from rest_framework import serializers
from rest_framework_gis import serializers as gs
from .models import AQDevice, AQFeed

class AQDeviceSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=512)
    title = serializers.CharField(max_length=512)
    url =  serializers.CharField(required=False, allow_blank=True,max_length=1024)
    imei = serializers.CharField(max_length=128)
    desc = serializers.CharField(required=False, allow_blank=True)
    lat =  serializers.CharField(max_length=24, required=False, allow_blank=True)
    lon =  serializers.CharField(max_length=24, required=False, allow_blank=True)
    #geom = serializers.PointField()
    created_on = serializers.DateTimeField(required=False)        

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
       #instance.geom = validated_data.get('geom', instance.geom)
        instance.created_on = validated_data.get('created_on', instance.created_on)
        instance.save()
        return instance


class AQFeedSerializer(serializers.ModelSerializer):
     class Meta:
         model = AQFeed
         fields = ('name','imei','created_on', 'humidity', 'temperature', 'pm10', 'pm25', 'count_large', 'count_small', 'lat', 'lon')