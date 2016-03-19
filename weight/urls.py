from django.conf.urls import url, include
from django.contrib import admin
from django.contrib.auth import views as auth_views

from data import urls as data_urls
from .views import home

urlpatterns = [
    url(r'^$', home, name='home'),
    url(r'^login/$', auth_views.login, {'template_name': 'login.html'},  name='login'),
    url(r'^logout/$', auth_views.logout, {}, name='logout'),
    url(r'^data/', include(data_urls)),
    url(r'^admin/', admin.site.urls),
]
