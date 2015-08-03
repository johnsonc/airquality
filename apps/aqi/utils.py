from datetime import date, datetime, timedelta

import random
from models import AQFeed, AQDevice
import dateutil.parser

def datespan(startDate, endDate, delta=timedelta(days=1)):
    currentDate = startDate
    while currentDate < endDate:
        yield currentDate
        currentDate += delta    

def generate_random_data(start_date, end_date, imei, name, lat, lon):
    try:
        start_time = datetime(*[int(i) for i in start_date.split("-")])
        end_time = datetime(*[int(i) for i in end_date.split("-")])
        #assert (imei=="" or imei== None), "IMEI cannot be blank"
        #assert (name=="" or name== None), "Name cannot be blank"
        #assert (lat=="" or lat== None), "Lat cannot be blank"
        #assert (lon=="" or lon== None), "Long cannot be blank"
        for ts in datespan(start_time, end_time, delta=timedelta(minutes=5)):
            aqf = AQFeed()
            aqf.imei=imei
            aqf.name=name            
            aqf.humidity = random.triangular(1,100) + random.random()
            aqf.temperature = random.triangular(15,45) + random.random()
            aqf.pm10 = random.triangular(1,100) + random.random()
            aqf.pm25 = random.triangular(1,100) + random.random()
            aqf.count_large = random.triangular(1,100) + random.random()
            aqf.count_small = random.triangular(1,100) + random.random()
            aqf.lat = lat
            aqf.lon = lon
            aqf.created_on=ts
            aqf.save()                    
    except: 
        print "Usage::"
        print  "generate_random_data(start_date, end_date, imei, name, lat, lon)" 
        print "Format of dates must be as :: YYYY-MM-DD-HH-MM "
        return 
        


def do(num=10, start_time='2015-06-22-12-23', end_time='2015-07-22-16-00'):
    for i in range(num):
        lat = random.triangular(18.3,20) + random.random()
        lon = random.triangular(72.5,73) + random.random()
        name_prefix='aqid'
        imei= str(random.random())[2:15]
        aqd = AQDevice()
        aqd.imei=imei
        aqd.title="IndiaSpend Air Quality Device " + str(i + 1)
        aqd.url = name_prefix + str(i)
        url = aqd.url
        aqd.desc = "Batch: " + str(1)  + ". Given to XYZ Inc. "
        aqd.lat = lat
        aqd.lon = lon
        aqd.geom = {u'type': u'Point', u'coordinates': [lon,lat]}
        aqd.save()
        generate_random_data(start_time,end_time,imei, url, lat, lon)


def initfeed(xfeed):
    x = xfeed['with'][0]
    aqd = AQDevice.objects.get(imei=x['content']['imei'])
    lat = aqd.geom['coordinates'][1]
    lon = aqd.geom['coordinates'][0]
    lastUpdateTime = dateutil.parser.parse("2015-08-03T02:24:00.000Z")
    for x in xfeed['with']:    
        d = dateutil.parser.parse(x['created'])
        if d < lastUpdateTime:
            continue        
        aqf = AQFeed()
        aqf.imei=x['content']['imei']
        aqf.name=""
        aqf.humidity = x['content']['h']
        aqf.temperature = x['content']['t']
        aqf.pm10 = x['content']['pm10']
        aqf.pm25 = x['content']['pm25']
        aqf.count_large = x['content']['cl']
        aqf.count_small = x['content']['cs']
        aqf.lat = lat
        aqf.lon = lon
        aqf.created_on=x['created']
        aqf.save()

