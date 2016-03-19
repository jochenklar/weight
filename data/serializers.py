from django.contrib.auth.models import User

from rest_framework.serializers import ModelSerializer

from .models import *


class DataPointSerializer(ModelSerializer):

    class Meta:
        model = DataPoint
        fields = ('id', 'datetime', 'weight')
        read_only_fields = ('id', 'datetime')
