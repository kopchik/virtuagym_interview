from rest_framework import serializers
from app.models import Plan, Day, Exercise


class PlanSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Plan
        #fields = ('url', 'username', 'email', 'groups')


class DaySerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Day
        #fields = ('url', 'name')


class ExerciseSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Exercise
        #fields = ('url', 'name')
