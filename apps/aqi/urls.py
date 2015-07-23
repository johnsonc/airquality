from django.conf.urls import patterns, include, url
import views as aqviews

urlpatterns = patterns('',
    url(r'devices/$', aqviews.aqdevice_list),
    url(r'devices/(?P<pk>[a-z\d]+)/$', aqviews.aqdevice_detail),
    url(r'aqfeed/$', aqviews.aqfeed_list),
    url(r'aqfeed/(?P<pk>[a-z\d]+)/$', aqviews.aqfeed_detail),
                       )
