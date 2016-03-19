from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User


class DataPoint(models.Model):

    user = models.ForeignKey(User)
    datetime = models.DateTimeField(auto_now_add=True, blank=True)
    weight = models.FloatField()

    class Meta:
        ordering = ('datetime', )

    def __str__(self):
        return 'user=%s; datatime=%s; weight=%s ' % (self.user, self.datetime, self.weight)
