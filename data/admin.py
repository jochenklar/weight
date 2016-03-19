from django.contrib import admin

from .models import *


class DataPointAdmin(admin.ModelAdmin):
    pass

admin.site.register(DataPoint, DataPointAdmin)
