from django.db import models


class Plan(models.Model):
    title = models.CharField(max_length=255)

    def __str__(self):
        return self.title


class Day(models.Model):
    date = models.DateField()
    name = models.CharField(max_length=255)
    plan = models.ForeignKey(Plan, related_name='days',
                             blank=True, on_delete=models.CASCADE)
    exercises = models.ManyToManyField('Exercise', blank=True)

    def __str__(self):
        plan = self.plan.title if self.plan else "(no plan)"
        return "{} -- {}".format(plan, self.date)


class Exercise(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name
