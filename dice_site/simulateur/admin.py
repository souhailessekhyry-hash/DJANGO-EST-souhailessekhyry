from django.contrib import admin
from .models import SimulationResult


@admin.register(SimulationResult)
class SimulationResultAdmin(admin.ModelAdmin):
    list_display = ("nb_experiences", "frequence", "date_simulation")
    list_filter = ("nb_experiences", "date_simulation")
    search_fields = ("nb_experiences",)
