"""
Definition des URLs de l'application simulateur.

Chaque URL correspond a une vue specifique du site.
"""

from django.urls import path
from . import views

app_name = "simulateur"

urlpatterns = [
    path("", views.accueil, name="accueil"),
    path("cours/", views.cours_index, name="cours_index"),
    path("cours/exceptions/", views.cours_exceptions, name="cours_exceptions"),
    path("cours/poo/", views.cours_poo, name="cours_poo"),
    path("cours/exemple/", views.cours_exemple, name="cours_exemple"),
    path("lancer/", views.lancer_interactif, name="lancer_interactif"),
    path("api/stats/", views.api_stats, name="api_stats"),
    path("api/simuler/<int:n>/", views.api_simuler, name="api_simuler"),
]
