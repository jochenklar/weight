from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now


class DataPoint(models.Model):

    user = models.ForeignKey(User)
    datetime = models.DateTimeField(blank=True)
    weight = models.FloatField()

    class Meta:
        ordering = ('datetime', )

    def __str__(self):
        return 'user=%s; datatime=%s; weight=%s ' % (self.user, self.datetime, self.weight)

    def save(self, *args, **kwargs):
        if not self.datetime:
            self.datetime = now()

        super(DataPoint, self).save(*args, **kwargs)
