"""
Vues de l'application simulateur.

Ce module contient les vues qui gerent la logique
d'affichage des pages du site.
"""

import json

from django.shortcuts import render
from django.http import JsonResponse

from .generateur import lancer_des, test, simulation


def accueil(request):
    """
    Vue de la page d'accueil.

    Affiche :
    - Le resultat brut de 10 lancers de des
    - Le test d'egalite pour chaque lancer
    - Un tableau des probabilites simulees pour differentes tailles
    - La convergence vers la probabilite theorique (1/6 ~ 0.167)

    Args:
        request: Objet HttpRequest de Django.

    Returns:
        HttpResponse: Page HTML rendue avec le contexte.
    """
    # Generer 10 lancers bruts avec leurs tests d'egalite
    lancers_bruts = []
    for i in range(10):
        des = lancer_des()
        lancers_bruts.append({
            "de1": des[0],
            "de2": des[1],
            "egaux": test(des),
        })

    # Effectuer les simulations pour differentes tailles d'echantillon
    tailles = [1, 10, 20, 100, 1000, 5000, 10000, 100000]
    simulations_resultats = []
    for taille in tailles:
        freq = simulation(taille)
        simulations_resultats.append({
            "taille": taille,
            "frequence": round(freq, 6),
            "theorique": round(1 / 6, 6),
            "difference": round(abs(freq - 1 / 6), 6),
        })

    # Preparer les donnees pour le graphique de convergence
    # (utilise uniquement pour le contexte, le graphique est affiche via les donnees)
    convergence = [
        {"taille": r["taille"], "frequence": r["frequence"]}
        for r in simulations_resultats
    ]

    chart_data = [
        {"n": r["taille"], "freq": r["frequence"], "teorique": round(1 / 6, 6)}
        for r in simulations_resultats
    ]
    chart_data_json = json.dumps(chart_data)

    contexte = {
        "lancers_bruts": lancers_bruts,
        "simulations": simulations_resultats,
        "probabilite_theorique": round(1 / 6, 6),
        "convergence": convergence,
        "chart_data_json": chart_data_json,
    }
    return render(request, "simulateur/accueil.html", contexte)


def lancer_interactif(request):
    """
    Vue AJAX qui effectue un lancer de deux des et retourne
    le resultat au format JSON pour l'affichage interactif.

    Returns:
        JsonResponse: {"de1": int, "de2": int, "egaux": bool, "somme": int}
    """
    des = lancer_des()
    return JsonResponse({
        "de1": des[0],
        "de2": des[1],
        "egaux": test(des),
        "somme": des[0] + des[1],
    })


def api_stats(request):
    """
    API JSON : statistiques theoriques et de convergence.
    Retourne les probabilites et les donnees pour le graphique.
    """
    tailles = [1, 10, 20, 100, 1000, 5000, 10000, 100000]
    simulations = []
    for taille in tailles:
        freq = simulation(taille)
        simulations.append({
            "n": taille,
            "freq": round(freq, 6),
            "teorique": round(1 / 6, 6),
        })
    return JsonResponse({
        "probabilite": round(1 / 6, 6),
        "simulations": simulations,
    })


def api_simuler(request, n):
    """
    API JSON : effectue N lancers et retourne les resultats agreges.
    """
    resultats = []
    doubles = 0
    for i in range(n):
        des = lancer_des()
        egaux = test(des)
        if egaux:
            doubles += 1
        resultats.append({
            "de1": des[0],
            "de2": des[1],
            "egaux": egaux,
        })
    return JsonResponse({
        "total": n,
        "doubles": doubles,
        "frequence": round(doubles / n, 6) if n > 0 else 0,
        "resultats": resultats,
    })


def cours_index(request):
    """
    Vue du sommaire du cours Python.
    Affiche les liens vers chaque partie.
    """
    return render(request, "simulateur/cours/index.html")


def cours_exceptions(request):
    """
    Vue de la partie 1 du cours : Gestion des exceptions.
    """
    return render(request, "simulateur/cours/exceptions.html")


def cours_poo(request):
    """
    Vue de la partie 2 du cours : Programmation Orientee Objet.
    """
    return render(request, "simulateur/cours/poo.html")


def cours_exemple(request):
    """
    Vue de la partie 3 du cours : Exemple POO complet.
    """
    return render(request, "simulateur/cours/exemple.html")
