# Create your views here.

import json
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from models import AQDevice, AQFeed,AQFeedLatest, State, City
from serializers import AQDeviceSerializer, AQFeedSerializer, AQFeedLatestSerializer, StateSerializer, CitySerializer
import datetime
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
from dateutil.tz import tzlocal
from dateutil import parser as dateparser
from django.core.exceptions import ObjectDoesNotExist

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
                "mapCenterLat":"21.15",
                "mapCenterLng":"79.09",
                "mapMumCenterLat":"20.00",
                "mapMumCenterLng":"72.00",
                "mapZoom":"4",
                "mapStateZoom":"6",
                "mapCityZoom":"8",
                "mapDeviceZoom":"11",
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
        data['alldevices']=aqserializer.data

        # Cycle through and send AQDevices according to location
        cityD = []
        for s in states:
            d = {'stateID':s.id}
            d['citiesInState']= []
            for c in City.objects.filter(stateID=s.id):
                if AQDevice.objects.filter(city=c.name).count() > 0:
                    c.live="true"
                    c.save()
                    d['citiesInState'].append({
                                'id':c.id,
                                'name':c.name,
                                'stateID':c.stateID,
                                'lat':c.lat,
                                'lon':c.lon,
                                'live':c.live
                                })        
                else:
                    c.live="false"
                    c.save()

            if len(d['citiesInState']) > 0:                                
                cityD.append(d)
            else:
                s.live="false"
                s.save()                

        deviceD = []
        for s in states:
            for c in City.objects.filter(stateID=s.id):
                dd={}
                dd['stateID']=s.id
                dd['cityID']=c.id
                dd['devicesInCity']= []
                aqds = AQDevice.objects.filter(city=c.name)
                aqserializer = AQDeviceSerializer(aqds, many=True)                             
                if len(aqds) > 0:                
                    aqdeviced = aqserializer.data
                    for a in aqdeviced:
                        a['stateID']=s.id
                        a['cityID']=c.id
                    
                    if len(aqds) ==1:
                        dd['devicesInCity'] = aqserializer.data  #.append(aqserializer.data[0])
                    if len(aqds) > 1:
                        dd['devicesInCity'] = aqserializer.data

                if len(dd['devicesInCity']) > 0:
                    deviceD.append(dd)                
                                
        data['cities']=cityD
        data['devices']=deviceD

        states = State.objects.all()
        serializer = StateSerializer(states, many=True)
        data['states']=serializer.data        
    return Response(data)        
    #except:
    #    return Response(status=404)



@csrf_exempt
@api_view(['GET', 'PUT'])
def aqdevice_detail_imei(request, imei):
    """
    Retrieve, update or delete an AQDevice
    """
    #import pdb; pdb.set_trace();
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
        sd = ed - datetime.timedelta(days=2)         
        aqfeeds = AQFeed.objects.raw_query(
            { 
                "created_on": 
                {
                    '$gte': sd,
                    '$lte': ed
                    }, 
                }
            ).order_by("-created_on")

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
        ed = datetime.datetime.now()
        sd = ed - datetime.timedelta(days=7)         
        aqfeed = AQFeed.objects.raw_query(
                { 
                    "created_on": 
                    {
                        '$gte': sd,
                        '$lte': ed
                        }, 
                    "imei":imei 
                    }
                ).order_by("-created_on")

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
def aqfeed_detail_time(request, imei, until_date):
    """
    Retrieve a feed instance according to time.
    """
    try:        
        if request.method == 'GET':
            #import pdb; pdb.set_trace();
            #ed = datetime.datetime.strptime(start_time, '%Y-%m-%dT%H:%M:%S')
            sdd = datetime.datetime.strptime(until_date, '%d-%m-%Y')
            sd = dateparser.parse(sdd.isoformat() + '+0530')
            today = datetime.datetime.now(tzlocal())
            if today.date() == sd.date():
                ed = today
                sd = ed - datetime.timedelta(hours=24)
            else:
                ed = sd + datetime.timedelta(hours=24)

            aqfeeds = AQFeed.objects.raw_query(
                { 
                    "created_on": 
                    {
                        '$gte': sd,
                        '$lte': ed
                        }, 
                    "imei":imei 
                    }
                ).order_by("-created_on")
            
            #aqfeed=[]
            #aqfeed = AQFeed.objects.filter(imei=imei).filter(created_on__gte=sd).filter(created_on__lte=ed).order_by('created_on')
            # if given date has no entries, loop backwards till a proper date is found
            while (len(aqfeeds) < 1):
                ed = sd.combine(sd.date(), datetime.time(0,0))
                sd = ed - datetime.timedelta(hours=24)                                         
                aqfeeds = AQFeed.objects.raw_query(
                { 
                    "created_on": 
                    {
                        '$gte': sd,
                        '$lte': ed
                        }, 
                    "imei":imei 
                    }
                ).order_by("-created_on")

            serializer = AQFeedSerializer(aqfeeds, many=True)
            return Response(serializer.data)    
        
    except AQFeed.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    





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


@csrf_exempt
@api_view(['GET'])
def aqfeed_latestAll(request):
    """
    Retrieve, the latest feed instance.
    """
    try:
        #aqfeed = AQFeedLatest.objects.order_by('imei');
        ed = datetime.datetime.now()
        sd = ed - datetime.timedelta(days=2)
        aqfeed = AQFeedLatest.objects.raw_query(
                {
                    "created_on":
                    {
                        '$gte': sd
                        }
                    }
                ).order_by("-created_on")

    except AQFeedLatest.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        #serializer = AQFeedSerializer(aqfeed)
        serializer = AQFeedLatestSerializer(aqfeed,many=True)
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
    #import pdb; pdb.set_trace()
    deviceip = get_client_ip(request)
    f = open('aqrequest.log', 'a+')    
    f.write("\n" + str(deviceip))
    
    if request.method == "GET":                
        d={}
        try:            
            try:
                d['imei'] = request.GET['i']
                d['humidity'] = request.GET['h']
                d['temperature'] = request.GET['t']
                d['pm10'] = request.GET['10']
                d['pm25'] = request.GET['25']
                d['count_large'] = request.GET['l']
                d['count_small'] = request.GET['s']        
                d['ip'] = deviceip             
            except: 
                d['imei'] = request.GET['imei']
                d['lon'] = request.GET['lon']
                d['lat'] = request.GET['lat']        
                d['pm10conc'] = request.GET['pm10conc']
                d['pm25conc'] = request.GET['pm25conc']
                d['pm10count'] = request.GET['pm10count']
                d['pm25count'] = request.GET['pm25count']
                d['humidity'] = request.GET['humidity']
                d['temperature'] = request.GET['temp']
                d['pm10avg'] = request.GET['pm10avg']
                d['pm25avg'] = request.GET['pm25avg']
                d['pm10countavg'] = request.GET['pm10countavg']
                d['pm25countavg'] = request.GET['pm25countavg']                              
                try:
                        d['aqi'] = request.GET['aqi']                              
                        d['aqi10'] = request.GET['aqi10']                              
                        d['aqi25'] = request.GET['aqi25']                              
                        #legacy fields
                        d['count_large'] = request.GET['pm10conc']
                        d['count_small'] = request.GET['pm25conc']        
                        d['pm10'] = request.GET['pm10count']
                        d['pm25'] = request.GET['pm25count']
                except:
                        pass

        except:
            import sys
            f.write("\nERROR: " + str(sys.exc_info()))                
            
        d['created_on'] = datetime.datetime.now()
        
        # try:
        #     if float(d['pm25']) > 1500 or float(d['pm10']) > 1500:
        #         f.write("\nInvalid data: " + str(d))
        #         f.close()                    
        #         return Response({"Feed not parsed!":"Values too large"}, status=status.HTTP_400_BAD_REQUEST)          
        # except:
        #     pass
        
        try:
            #1. check the device IP and load lat, lon from there, if changed, update location
            aqd = AQDevice.objects.get(imei=d['imei'])
            try:
                if not (d['lat'] == aqd.geom['coordinates'][1] and d['lon'] == aqd.geom['coordinates'][0]):
                    try:                
                        aqd.geom = {u'type': u'Point', u'coordinates': [d['lon'], d['lat']]}
                        aqd.save()
                    except:
                        import sys
                        f.write("\nERROR updating location: " + str(sys.exc_info()))
            except:
                pass
                                        
            #if aqd.geom != deviceip:
            #if not (d['lat'] = aqd.geom['coordinates'][1] and d['lon'] = aqd.geom['coordinates'][0]) :   

                #2.  if not matching , ask for new geo loc. 
                #even if call fails, fail silently since device streams every 5 min.
                #ipdetails = requests.get("http://ip-api.com/json/"+ deviceip ).json()
                #aqd.ip = deviceip
                #aqd.lat = ipdetails['lat']
                #aqd.lon = ipdetails['lon']            
                # Until GPS coarse loc is available, turn off overwriting            
                #aqd.geom = {u'type': u'Point', u'coordinates': [d['lon'], d['lat']]}
                #aqd.save()
                
                # 3. Update state, city details if device changes locations
                #try:
                #    # 4. Check and get state in incoming IP
                #    s = getState(ipdetails)    
                #    //jj needs geo lookup
                #    c = create_or_getCity(ipdetails['city'], s, ipdetails['lat'], ipdetails['lon'])
                #    # update status as live. 
                #    s.live="true"
                #    s.save()
                #    c.live="true"
                #    c.save()
                #except:
                #    import sys
                #    f.write("\nERROR: " + str(sys.exc_info()))
                #after ascertaining city and state objects, save aqd 
                #aqd.city = c.name
                #aqd.state = s.name
                # Until GPS coarse loc is available, turn off overwriting            
                #aqd.save()
                #f.write("\nAQD:" + str(aqd.__dict__))
                #write to log if loc of AQD changed.
                #d['lat']=ipdetails['lat'] 
                #d['lat']=ipdetails['lat'] 
            #else:
                #d['lat'] = aqd.geom['coordinates'][1]   
                #d['lon'] = aqd.geom['coordinates'][0]   
        except:       
            import sys
            f.write("\nERROR: " + str(sys.exc_info()))

        f.write("\nAQFeed:" + str(d))
        f.close()        
        try:
            serLatest = AQFeedLatest.objects.get(imei=d['imei'])
            try:
                serLatest.humidity = d['humidity']
                serLatest.temperature = d['temperature']
                serLatest.pm10 = d['pm10']
                serLatest.pm25 = d['pm25']
                serLatest.count_large = d['count_large']
                serLatest.count_small = d['count_small']
            except:
                pass
            try:
                serLatest.pm25 = d['pm25']
                serLatest.pm10conc = d['pm10conc']
                serLatest.pm25conc = d['pm25conc']
                serLatest.pm10count = d['pm10count']
                serLatest.pm25count = d['pm25count']
                serLatest.pm10avg = d['pm10avg']
                serLatest.pm25avg = d['pm25avg']
                serLatest.pm10countavg = d['pm10countavg']
                serLatest.pm25countavg = d['pm25countavg']
                serLatest.created_on = d['created_on']
                serLatest.aqi = d['aqi']
                serLatest.aqi10 = d['aqi10']
                serLatest.aqi25 = d['aqi25']
                serLatest.lon = d['lon'].replace(",", "")
                serLatest.lat = d['lat'].replace(",", "")
            except:
                pass
            serLatest.save()
        except AQFeedLatest.DoesNotExist: 
            serLatest = AQFeedLatestSerializer(data=d)
            if serLatest.is_valid():
                serLatest.save()
        else:       
            pass

        serializer = AQFeedSerializer(data=d)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def getState(ipdetails):
    try:
        s = State.objects.get(region_code=ipdetails['region'])
    except State.DoesNotExist:     
        #region lookup is more robust than regionName for State. 
        try:
            s = State.objects.get(name=ipdetails['regionName'])
        except State.DoesNotExist:    
            #But just in case, fallback to a reverse lookup, and if fails, then raise Error
            r = requests.get("http://photon.komoot.de/reverse?lon=" + str(ipdetails['lon']) + "&lat=" + str(ipdetails['lat'])).json()
            s = State.objects.get(name=r['features'][0]['properties']['state'])
    return s
                

def create_or_getCity(cityName, state, lat,lon):
    try:
        c = City.objects.get(name=cityName)
    except City.DoesNotExist:        
            r = requests.get("http://photon.komoot.de/api/?q={},{}&limit=1&lat={}&lon={}".format(cityName, state.name, lat,lon)).json()
            
            lastCity = City.objects.latest('created_on')
            c = City()
            c.id = lastCity.id +1
            c.name=cityName        
            c.stateID=state.id
            c.lat= r['features'][0]['geometry']['coordinates'][1]
            c.lon= r['features'][0]['geometry']['coordinates'][0]
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
        aqdatapoints = AQFeed.objects.raw_query(
            { 
                "created_on": 
                {
                    '$gte': sd,
                    '$lte': ed
                    }, 
                }
            ).order_by("-created_on")
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

        aqdatapoints = AQFeed.objects.raw_query(
            { 
                "created_on": 
                {
                    '$gte': sd,
                    '$lte': ed
                    }, 
                }
            ).order_by("-created_on")

        serializer = AQFeedSerializer(aqdatapoints, many=True)
        return Response(serializer.data)
