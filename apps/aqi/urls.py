from django.conf.urls import patterns, include, url
import views as aqviews

urlpatterns = patterns("",
    url(r'config/$', aqviews.displayConfig),
    url(r'devices/$', aqviews.aqdevice_list),
    url(r'devices/locations/$', aqviews.aqdevice_locations),
    url(r'devices/imei/(?P<imei>[a-z\d]+)/$', aqviews.aqdevice_detail_imei),
    url(r'devices/city/(?P<city>[A-Za-z\d]+)', aqviews.aqdevice_city),
    url(r'devices/state/(?P<state>[A-Za-z\d]+)', aqviews.aqdevice_state),
    url(r'aqfeed/$', aqviews.aqfeed_list),
    url(r'aqfeed/(?P<imei>[a-z\d]+)/$', aqviews.aqfeed_detail),
    url(r'aqfeed/(?P<imei>[a-z\d]+)/(?P<until_date>[:T\-\d]+)/$', aqviews.aqfeed_detail_time),
    url(r'aqfeed/latest/(?P<imei>[a-z\d]+)/$', aqviews.aqfeed_latest),
    url(r'aqfeed/(?P<start_time>[:T\-\d]+)/(?P<end_time>[:T\-\d]+)/$', aqviews.aqdatapointintime),
    url(r'aqfeed/(?P<device_imei>[a-z\d]+)/(?P<start_time>[:T\-\d]+)/(?P<end_time>[:T\-\d]+)/$', aqviews.aqdatapointsfordevice),
    url(r'aqd/$', aqviews.aqdatapoint),                       
                       )
