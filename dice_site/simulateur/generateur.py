"""
Module de simulation de lancers de deux des equilibres a 6 faces.

Ce module fournit les fonctions necessaires pour simuler
le lancer de deux des et calculer la frequence de succes
(lorsque les deux des ont la meme valeur).

Utilise uniquement le module standard random.
"""

import random


def lancer_des():
    """
    Simule le lancer de deux des a 6 faces.

    Returns:
        tuple: Un tuple (valeur_de_1, valeur_de_2) contenant
               deux entiers compris entre 1 et 6.
    """
    de1 = random.randint(1, 6)
    de2 = random.randint(1, 6)
    return (de1, de2)


def test(resultat_des):
    """
    Teste si les deux des ont la meme valeur.

    Args:
        resultat_des (tuple): Un tuple (valeur_de_1, valeur_de_2).

    Returns:
        bool: True si les deux valeurs sont egales, sinon False.
    """
    return resultat_des[0] == resultat_des[1]


def simulation(nb_experiences):
    """
    Effectue plusieurs simulations de lancers de deux des
    et retourne la frequence de succes (des egaux).

    La probabilite theorique est P = 6/36 = 1/6 ~ 0.167.

    Args:
        nb_experiences (int): Nombre de lancers a effectuer.

    Returns:
        float: Frequence de succes (nombre de succes / nombre total).
    """
    succes = 0
    for _ in range(nb_experiences):
        des = lancer_des()
        if test(des):
            succes += 1
    return succes / nb_experiences
