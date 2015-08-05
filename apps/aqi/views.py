
# Create your views here.

import json
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from models import AQDevice, AQFeed
from serializers import AQDeviceSerializer, AQFeedSerializer
import datetime
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


class JSONResponse(HttpResponse):
    """
    An HttpResponse that renders its content into JSON.
    """
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)


@csrf_exempt
@api_view(['GET', 'POST'])
def aqdevice_list(request):
    """
    List all devices, or create a new device.
    """
    if request.method == 'GET':
        aqdevices = AQDevice.objects.all()
        serializer = AQDeviceSerializer(aqdevices, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = JSONParser().parse(request)
        serializer = AQDeviceSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@csrf_exempt
@api_view(['GET', 'PUT'])
def aqdevice_detail(request, pk):
    """
    Retrieve, update or delete an AQDevice
    """
    try:
        aqdevice = AQDevice.objects.get(pk=pk)
    except AQDevice.DoesNotExist:
        return Response(status=404)

    if request.method == 'GET':
        serializer = AQDeviceSerializer(aqdevice)
        return Response(serializer.data)

    elif request.method == 'PUT':
        data = JSONParser().parse(request)
        serializer = AQDeviceSerializer(aqdevice, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        aqdevice.delete()
        return Response(status=204)

@csrf_exempt
@api_view(['GET', 'POST'])
def aqfeed_list(request):
    """
    List all data points for the last two days or create a new datapoint.
    """
    if request.method == 'GET':
        ed = datetime.datetime.now()
        sd = ed - datetime.timedelta(days=1)         
        aqfeeds = AQFeed.objects.filter(created_on__gte=sd).filter(created_on__lte=ed).order_by('created_on')
        serializer = AQFeedSerializer(aqfeeds, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = AQFeedSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET', 'PUT'])
def aqfeed_detail(request, pk):
    """
    Retrieve, update or delete a feed instance.
    """
    try:
        aqfeed = AQFeed.objects.get(pk=pk)
    except AQFeed.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AQFeedSerializer(aqfeed, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        #serializer = AQFeedSerializer(aqfeed)
        #return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = AQFeedSerializer(aqfeed, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        aqfeed.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

@api_view(['GET'])
def aqdatapoint(request):
    """
    Add a AQ data point via GET
    """
    deviceip = get_client_ip(request)
    f = open('/tmp/aqrequest.log', 'a')
    f.write(deviceip)
    f.close()
    if request.method == "GET":        
        #import pdb; pdb.set_trace()
        d={}
        d['imei'] = request.GET['i']
        d['humidity'] = request.GET['h']
        d['temperature'] = request.GET['t']
        d['pm10'] = request.GET['10']
        d['pm25'] = request.GET['25']
        d['count_large'] = request.GET['l']
        d['count_small'] = request.GET['s']        
        try:
            d['ip'] = deviceip
        except:
            pass
        d['created_on'] = datetime.datetime.now()

        serializer = AQFeedSerializer(data=d)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
def aqdatapointintime(request, start_time, end_time):
    """
    Add a AQ data point via GET
    """
    if request.method == 'GET':
        try:
            sd = datetime.datetime.strptime(start_time, '%Y-%m-%dT%H:%M:%S')
            ed = datetime.datetime.strptime(end_time, '%Y-%m-%dT%H:%M:%S')
        except:
            return Response({'error': "Format of date should be YYYY-MM-DDTHH:MM:SS, eg. 2015-06-22T17:03:00"}, status=status.HTTP_400_BAD_REQUEST)
        aqdatapoints = AQFeed.objects.filter(created_on__gte=sd).filter(created_on__lte=ed)
        serializer = AQFeedSerializer(aqdatapoints, many=True)
        return Response(serializer.data)


@api_view(['GET'])
def aqdatapointsfordevice(request, device_imei, start_time, end_time):
    """
    Add a AQ data point via GET
    """
    if request.method == 'GET':
        try:
            aqd = AQDevice.objects.filter(imei=device_imei)
            if not len(aqd) > 0:
                return Response({'error': "Device not found"}, status=status.HTTP_400_BAD_REQUEST)                     
        except:
            return Response({'error': "Error in finding device. Is the device imei proper or registered?"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            sd = datetime.datetime.strptime(start_time, '%Y-%m-%dT%H:%M:%S')
            ed = datetime.datetime.strptime(end_time, '%Y-%m-%dT%H:%M:%S')            
        except:
            return Response({'error': "Format of date should be YYYY-MM-DDTHH:MM:SS, eg. 2015-06-22T17:03:00"}, status=status.HTTP_400_BAD_REQUEST)
        aqdatapoints = AQFeed.objects.filter(imei=device_imei).filter(created_on__gte=sd).filter(created_on__lte=ed)
        serializer = AQFeedSerializer(aqdatapoints, many=True)
        return Response(serializer.data)
