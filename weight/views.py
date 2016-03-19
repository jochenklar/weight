from django.http import HttpResponseRedirect
from django.shortcuts import render


def home(request):
    if request.user.is_authenticated():
        return render(request, 'home.html', {
            'buttons': ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0']
        })
    else:
        return HttpResponseRedirect('/login/')
