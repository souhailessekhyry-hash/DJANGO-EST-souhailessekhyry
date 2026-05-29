"""
Definition des URLs de l'application simulation.
"""

from django.urls import path
from . import views

app_name = 'simulation'

urlpatterns = [
    path('', views.home, name='home'),
    path('api/lancer/', views.api_lancer, name='api_lancer'),
    path('cours-python/', views.cours_python, name='cours_python'),
]
