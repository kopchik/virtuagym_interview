from django.conf.urls import url, include
from rest_framework import routers
from app.views import PlanViewSet, DayViewSet, ExerciseViewSet

router = routers.DefaultRouter()
router.register(r'plans', PlanViewSet)
router.register(r'Days', DayViewSet)
router.register(r'exercises', ExerciseViewSet)
urlpatterns = router.urls

###########
# SWAGGER #
###########

from rest_framework.decorators import api_view, renderer_classes
from rest_framework import response, schemas
from rest_framework_swagger.renderers import OpenAPIRenderer, SwaggerUIRenderer


@api_view()
@renderer_classes([OpenAPIRenderer, SwaggerUIRenderer])
def schema_view(request):
    generator = schemas.SchemaGenerator(title='Bookings API')
    schema = generator.get_schema(request=request)
    return response.Response(schema)
    #from django.http import JsonResponse
    # return JsonResponse({})

urlpatterns += [
    url(r'api/', schema_view, name='the-api'),
]
