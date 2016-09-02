from django.conf.urls import url, include
from rest_framework import routers
from app.views import PlanViewSet, DayViewSet, ExerciseViewSet, CurrentUserView

from rest_framework.decorators import api_view, renderer_classes
from rest_framework import response, schemas
from rest_framework_swagger.renderers import OpenAPIRenderer, SwaggerUIRenderer


# REST
router = routers.DefaultRouter()
router.register(r'plans', PlanViewSet)
router.register(r'Days', DayViewSet)
router.register(r'exercises', ExerciseViewSet)
#router.register(r'me', CurrentUserView, base_name='app')
urlpatterns = router.urls


# SWAGGER
@api_view()
@renderer_classes([OpenAPIRenderer, SwaggerUIRenderer])
def schema_view(request):
    generator = schemas.SchemaGenerator(title='Hi there!')
    schema = generator.get_schema(request=request)
    return response.Response(schema)

urlpatterns += [
    url(r'api/', schema_view, name='another-api-view'),
    url(r'me/', CurrentUserView.as_view(), name='current-user'),
]
