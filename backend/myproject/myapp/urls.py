from django.urls import path
from . import views

urlpatterns = [
    path('', views.handle_post_request, name='handle_post_request'),
]
