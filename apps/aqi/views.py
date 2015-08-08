
# Create your views here.

import json
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from models import AQDevice, AQFeed, State, City
from serializers import AQDeviceSerializer, AQFeedSerializer, StateSerializer, CitySerializer
import datetime
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests

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
@api_view(['GET'])
def aqdevice_city(request, city):
    """
    Retrieve  AQDevices acc. to city
    """    
    try:
        if request.method == 'GET':
            aqdevices = AQDevice.objects.filter(city=city)
            serializer = AQDeviceSerializer(aqdevices, many=True)
            return Response(serializer.data)        
    except:
        return Response(status=404)
    
@csrf_exempt
@api_view(['GET'])
def aqdevice_state(request, state):
    """
    Retrieve  AQDevices acc. to state
    """    
    try:
        if request.method == 'GET':
            aqdevices = AQDevice.objects.filter(state=state)
            serializer = AQDeviceSerializer(aqdevices, many=True)
            return Response(serializer.data)        
    except:
        return Response(status=404)    

@csrf_exempt
@api_view(['GET'])
def displayConfig(request):
    """
    Get display config
    """    
    try:
        if request.method == 'GET':
            
            config  = {
                "breakpoints":[{"id":1,
                                "remark":"Good",
                                "color":"#00B050",
                                "uplimit":50,
                                "description":"Minimal impact"},
                               {"id":2,
                                "remark":"Satisfactory",
                                "color":"#92D050",
                                "uplimit":100,
                                "description":"Minor breathing discomfort to sensitive people"},
                               {"id":3,
                                "remark":"Moderate",
                                "color":"#FFFF00",
                                "uplimit":200,
                                "description":"Breathing discomfort to the people with lungs, asthma and heart diseases"},
                               {"id":4,
                                "remark":"Poor",
                                "color":"#FF9900",
                                "uplimit":300,
                                "description":"Breathing discomfort to most people on prolonged exposure"},
                               {"id":5,
                                "remark":"Very Poor",
                                "color":"#FF0000",
                                "uplimit":400,
                                "description":"Respiratory illness on prolonged exposure"},
                               {"id":6,
                                "remark":"Severe",
                                "color":"#C00000",
                                "uplimit":500,
                                "description":"Affects healthy people and seriously impacts those with existing diseases"}],
                "mapCenterLat":"21.15",
                "mapCenterLng":"79.09",
                "mapMumCenterLat":"20.00",
                "mapMumCenterLng":"72.00",
                "mapZoom":"4",
                "mapStateZoom":"6",
                "mapCityZoom":"8",
                "mapStationZoom":"11",
                "interval":"24"
                }
                        
            return Response(config)     
    except:
        return Response(status=404)    


@csrf_exempt
@api_view(['GET'])
def aqdevice_locations(request):
    """
    Retrieve  AQDevices acc. to city and state
    """    
    #try:
    if request.method == 'GET':
        data = {}
        states = State.objects.all()
        cities = City.objects.all()

        aqdevices = AQDevice.objects.all()
        aqserializer = AQDeviceSerializer(aqdevices, many=True)
        data['devices']=aqserializer.data
        
        serializer = StateSerializer(states, many=True)
        data['states']=serializer.data

        cityD = []
        for s in states:
            d = {'stateID':s.id}
            d['citiesInState']= []
            for c in cities:
                if c.stateID == s.id:
                    d['citiesInState'].append({
                            'id':c.id,
                            'name':c.name,
                            'stateID':c.stateID,
                            'lat':c.lat,
                            'lon':c.lon,
                            'live':c.live
                            })                
                
            cityD.append(d)


        deviceD = []
        for s in states:
            for c in cities:
                if c.stateID== s.id:
                    dd={}
                    dd['stateID']=s.id
                    dd['cityID']=c.id
                    dd['devicesInCity']= []
                    aqds = AQDevice.objects.filter(city=c.name)
                    aqserializer = AQDeviceSerializer(aqds, many=True)
                    dd['devicesInCity'].append(aqserializer.data)
                    deviceD.append(dd)
                                
        data['cities']=cityD
        data['stations']=deviceD
    return Response(data)        
    #except:
    #    return Response(status=404)



@csrf_exempt
@api_view(['GET', 'PUT'])
def aqdevice_detail(request, imei):
    """
    Retrieve, update or delete an AQDevice
    """
    try:
        aqdevice = AQDevice.objects.get(imei=imei)
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
def aqfeed_detail(request, imei):
    """
    Retrieve, update or delete a feed instance.
    """
    try:
        aqfeed = AQFeed.objects.filter(imei=imei)
    except AQFeed.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AQFeedSerializer(aqfeed, data=request.data, many=True)
        if serializer.is_valid():
            #serializer.save()
            return Response(serializer.data)
        else:
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


@csrf_exempt
@api_view(['GET'])
def aqfeed_latest(request, imei):
    """
    Retrieve, the latest feed instance.
    """
    try:
        aqfeed = AQFeed.objects.filter(imei=imei).latest('created_on')        
    except AQFeed.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = AQFeedSerializer(aqfeed)
        return Response(serializer.data)    



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
    f.write("\n" + str(deviceip))
    
    if request.method == "GET":        
        d={}
        d['imei'] = request.GET['i']
        d['humidity'] = request.GET['h']
        d['temperature'] = request.GET['t']
        d['pm10'] = request.GET['10']
        d['pm25'] = request.GET['25']
        d['count_large'] = request.GET['l']
        d['count_small'] = request.GET['s'] 

        try:
            #import pdb; pdb.set_trace()        
            try:            
                deviceip = request.GET['ip']
            except:
                pass

            #1. check the device IP and load lat, lon from there, if changed, update location
            aqd = AQDevice.objects.get(imei=d['imei'])   
            if aqd.ip != deviceip:
                #2.  if not matching , ask for new geo loc. 
                #even if call fails, fail silently since device streams every 5 min.
                ipdetails = requests.get("http://ip-api.com/json/"+ deviceip ).json()
                aqd.ip = deviceip
                aqd.lat = ipdetails['lat']
                aqd.lon = ipdetails['lon']            
                aqd.geom = {u'type': u'Point', u'coordinates': [aqd.lon, aqd.lat]}
                # 3. Update state, city details if device changes locations
                try:
                    # 4. Check and get state in incoming IP
                    try:
                        s = State.objects.get(region_code=ipdetails['region'])
                    except State.DoesNotExist:     
                        import sys
                        f.write("\nERROR: " + str(sys.exc_info()))
                        #region lookup is more robust than regionName for State. But just in case, fallback to Maharastra :)
                        s = State.objects.get(id=10)                            
                    
                    c = create_or_getCity(ipdetails['city'], s.id, aqd.lat, aqd.lon)

                    # update status as live. 
                    s.live="true"
                    s.save()
                    c.live="true"
                    c.save()
                except:
                    import sys
                    f.write("\nERROR: " + str(sys.exc_info()))
                #after ascertaining city and state objects, save aqd 
                aqd.city = c.name
                aqd.state = s.name
                aqd.save()
                f.write("\nAQD:" + str(aqd.__dict__))
                #write to log if loc of AQD changed.

            d['ip'] = deviceip            
            d['lat'] = aqd.lat
            d['lon'] = aqd.lon            
        except:       
            import sys
            f.write("\nERROR: " + str(sys.exc_info()))

        d['created_on'] = datetime.datetime.now()
        f.write("\nAQFeed:" + str(d))
        f.close()        
        serializer = AQFeedSerializer(data=d)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def create_or_getCity(cityName, stateID, lat,lon):
    try:
        c = City.objects.get(name=cityName)
    except City.DoesNotExist:                    
        lastCity = City.objects.latest('created_on')
        c = City()
        c.id = lastCity.id +1
        c.name=cityName        
        c.stateID=stateID
        c.lat=lat
        c.lon=lon    
        c.live="true"
        c.save()
    return c

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
