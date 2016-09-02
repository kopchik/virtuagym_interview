from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import authenticate

from app.models import Plan, Day, Exercise
from app.serializers import PlanSerializer, DaySerializer, ExerciseSerializer


class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all().order_by('-id')
    serializer_class = PlanSerializer


class DayViewSet(viewsets.ModelViewSet):
    queryset = Day.objects.all().order_by('-date')
    serializer_class = DaySerializer


class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.all().order_by('-id')
    serializer_class = ExerciseSerializer


class CurrentUserView(APIView):
    """ Quick-n-dirty view to detect if user is already logged in. """
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            return JsonResponse({'username': user.username})
        return HttpResponse('Unauthorized', status=403)

    def get(self, request):
        user = request.user
        return JsonResponse({'username': user.username})
