from rest_framework import serializers
from app.models import Plan, Day, Exercise


class DaySerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Day


class ExerciseSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Exercise


class PlanSerializer(serializers.HyperlinkedModelSerializer):
    days = DaySerializer(many=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    class Meta:
        model = Plan
        field = ['days']

    def create(self, validated_data):
        """ Overrides default method to support nested models. """
        days_data = validated_data.pop('days')
        plan = Plan.objects.create(**validated_data)
        # nested models need to be created separately :(
        for day_data in days_data:
            exercises = day_data.pop('exercises')
            day = Day.objects.create(plan=plan, **day_data)
            for exercise in exercises:
                day.exercises.add(exercise)
        return plan

    def update(self, instance, validated_data):
        """ Overrides default method to support nested models. """
        days_data = validated_data.pop('days')
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()

        # we update days by removing them...
        for old_day in instance.days.all():
            old_day.delete()

        # ... and creating them back again
        for new_day in days_data:
            new_day.pop('plan')  # we'll use 'instance' that's already saved
            exercises = new_day.pop('exercises')
            day = Day.objects.create(plan=instance, **new_day)
            for exercise in exercises:
                day.exercises.add(exercise)

        return instance
