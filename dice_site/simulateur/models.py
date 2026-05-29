"""
Modeles de l'application simulateur.

Ce module definit les modeles Django utilises pour stocker
les resultats de simulation et les commentaires pedagogiques.
"""

from django.db import models


class SimulationResult(models.Model):
    """
    Enregistre le resultat d'une simulation.

    Attributes:
        nb_experiences (int): Nombre de lancers effectues.
        frequence (float): Frequence de succes obtenue.
        date_simulation (datetime): Date et heure de la simulation.
    """
    nb_experiences = models.IntegerField(
        verbose_name="Nombre d'experiences"
    )
    frequence = models.FloatField(
        verbose_name="Frequence de succes"
    )
    date_simulation = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de simulation"
    )

    class Meta:
        verbose_name = "Resultat de simulation"
        verbose_name_plural = "Resultats de simulations"
        ordering = ["-date_simulation"]

    def __str__(self):
        return (
            f"{self.nb_experiences} lancers -> "
            f"{self.frequence:.4f} ({self.date_simulation:%d/%m/%Y %H:%M})"
        )
