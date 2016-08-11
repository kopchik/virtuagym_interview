from django.shortcuts import render
from rest_framework import viewsets

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
