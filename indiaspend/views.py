from django.shortcuts import redirect
from django.shortcuts import render_to_response
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.template import RequestContext
import json
from os.path import join


def home(request):
    return render_to_response('home.html', {} )


def index(request):
    return render_to_response('index.html', {} )


def register(request):
    return render_to_response('register.html', {} )


def analysis(request):
    return render_to_response('analysis.html', {} )
