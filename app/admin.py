from django.contrib import admin
from app.models import Plan, Day, Exercise


class PlanAdmin(admin.ModelAdmin):
    pass
admin.site.register(Plan, PlanAdmin)


class DayAdmin(admin.ModelAdmin):
    pass
admin.site.register(Day, DayAdmin)


class ExerciseAdmin(admin.ModelAdmin):
    pass
admin.site.register(Exercise, ExerciseAdmin)
