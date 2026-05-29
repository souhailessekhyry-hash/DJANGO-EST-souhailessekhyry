"""
Module de simulation de lancers de deux des equilibres a 6 faces.

Fournit les fonctions pour simuler le lancer de deux des
et calculer la frequence de succes (des egaux).
Utilise uniquement le module standard random.
"""

import random


def lancer_des():
    """
    Simule le lancer de deux des a 6 faces.

    Returns:
        tuple: (valeur_de_1, valeur_de_2) deux entiers entre 1 et 6.
    """
    return (random.randint(1, 6), random.randint(1, 6))


def test(resultat_des):
    """
    Teste si les deux des ont la meme valeur.

    Args:
        resultat_des (tuple): (valeur_de_1, valeur_de_2).

    Returns:
        bool: True si les valeurs sont egales.
    """
    return resultat_des[0] == resultat_des[1]


def simulation(nb_experiences):
    """
    Effectue plusieurs lancers et retourne la frequence de succes.

    Probabilite theorique: P = 6/36 = 1/6 ~ 0.167.

    Args:
        nb_experiences (int): Nombre de lancers.

    Returns:
        float: Frequence de succes.
    """
    succes = 0
    for _ in range(nb_experiences):
        if test(lancer_des()):
            succes += 1
    return succes / nb_experiences
