from django.conf.urls import url, include
from django.contrib import admin
from django.contrib.auth import logout


urlpatterns = [
    url(r'^app/', include('app.urls')),
    url(r'^admin/', admin.site.urls),
    url(r'^logout$', logout, {'next_page': '/'})
]
