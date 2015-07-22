# Create your views here.

import json
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from models import AQDevice, AQFeed
from serializers import AQDeviceSerializer, AQFeedSerializer

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
def aqdevice_list(request):
    """
    List all devices, or create a new device.
    """
    if request.method == 'GET':
        aqdevices = AQDevice.objects.all()
        serializer = AQDeviceSerializer(aqdevices, many=True)
        return JSONResponse(serializer.data)

    elif request.method == 'POST':
        data = JSONParser().parse(request)
        serializer = AQDeviceSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JSONResponse(serializer.data, status=201)
        return JSONResponse(serializer.errors, status=400)


@csrf_exempt
def aqdevice_detail(request, pk):
    """
    Retrieve, update or delete an AQDevice
    """
    try:
        aqdevice = AQDevice.objects.get(pk=pk)
    except AQDevice.DoesNotExist:
        return HttpResponse(status=404)

    if request.method == 'GET':
        serializer = AQDeviceSerializer(aqdevice)
        return JSONResponse(serializer.data)

    elif request.method == 'PUT':
        data = JSONParser().parse(request)
        serializer = AQDeviceSerializer(aqdevice, data=data)
        if serializer.is_valid():
            serializer.save()
            return JSONResponse(serializer.data)
        return JSONResponse(serializer.errors, status=400)

    elif request.method == 'DELETE':
        aqdevice.delete()
        return HttpResponse(status=204)


@api_view(['GET', 'POST'])
def aqfeed_list(request):
    """
    List all data points or create a new one.
    """
    if request.method == 'GET':
        aqfeeds = AQFeed.objects.all()
        serializer = AQFeedSerializer(aqfeeds, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = AQFeedSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def aqfeed_detail(request, pk):
    """
    Retrieve, update or delete a feed instance.
    """
    try:
        aqfeed = AQFeed.objects.get(pk=pk)
    except AQFeed.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AQFeedSerializer(aqfeed)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = AQFeedSerializer(aqfeed, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        aqfeed.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
