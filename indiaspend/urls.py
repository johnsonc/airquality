from django.conf.urls import patterns, include, url
from django.views.generic import ListView, DetailView

from apps.aqi.models import AQDevice
from apps.aqi import views as aqviews
#import apps.aqi
from apps.aqi import urls as aqurls 
#from django.views.generic.simple import redirect_to
from django.views.generic import RedirectView
#from apps.aqi import views
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()
aqdevice_detail = DetailView.as_view(model=AQDevice)
aqdevice_list = ListView.as_view(model=AQDevice)

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'indiaspend.views.home', name='home'),
    url(r'^index$', 'indiaspend.views.index', name='index'),
    url(r'^register-device', 'indiaspend.views.register', name='register'),
    #url(r"^account/", include("account.urls")),
    url(r'^device/(?P<pk>[a-z\d]+)/$', aqdevice_detail, name='aqdevice_detail'),
    url(r'^view-devices', aqdevice_list, name='aqdevice_list'),
    url(r'^analysis', 'indiaspend.views.analysis', name='analysis'),
    url(r'^fryanalysis', 'indiaspend.views.fryanalysis', name='fryanalysis'),
    url(r'^api/', include(aqurls)),
    url(r'^api-docs/', include('rest_framework_swagger.urls')),
    #url(r'^api/devices/$', aqviews.aqdevice_list),
    #url(r'^api/devices/(?P<pk>[a-z\d]+)/$', aqviews.aqdevice_detail),
    #url(r'^aqi/', include('apps.aqi.urls')),
    #url(r'^register-device$', 'indiaspend.views.register', name='home'),
    # url(r'^indiaspend/', include('indiaspend.foo.urls')),
    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^aq/static/(?P<path>.*)$', RedirectView.as_view(url='/static/%(path)s')),    
    url(r'^aq/api/(?P<path>.*)$', RedirectView.as_view(url='/api/%(path)s')),    
    url(r'^aq/(?P<path>.*)$', RedirectView.as_view(url='/%(path)s')),    
    url(r'^static/(?P<path>.*)$', RedirectView.as_view(url='/staticaaa/%(path)s')),    
)
