from rest_framework import serializers
from app.models import Plan, Day, Exercise


class DaySerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Day


class ExerciseSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Exercise


class PlanSerializer(serializers.HyperlinkedModelSerializer):
    days = DaySerializer(source='get_days', many=True)

    class Meta:
        model = Plan
        field = ('days',)
