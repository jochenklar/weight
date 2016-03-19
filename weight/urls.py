from django.conf.urls import url, include
from django.contrib import admin
from django.views.generic.base import TemplateView

from data import urls as data_urls

urlpatterns = [
    url(r'^$', TemplateView.as_view(template_name='home.html')),
    url(r'^data/', include(data_urls)),
    url(r'^admin/', admin.site.urls),
]
