"""
Vues de l'application simulation.

Geret l'affichage de la page d'accueil, l'API de lancer
et la page de cours Python.
"""

from django.shortcuts import render
from django.http import JsonResponse
from .generateur import lancer_des, test, simulation


def home(request):
    """
    Page d'accueil avec les 10 lancers initiaux et le tableau de convergence.

    Utilise les sessions Django pour suivre les statistiques
    interactives de l'utilisateur.
    """
    # 10 lancers initiaux
    lancers_bruts = []
    for _ in range(10):
        des = lancer_des()
        lancers_bruts.append({
            'de1': des[0],
            'de2': des[1],
            'egaux': test(des),
        })

    # Simulations de convergence
    tailles = [1, 10, 20, 100, 1000, 5000, 10000, 100000]
    simus = []
    for t in tailles:
        f = simulation(t)
        simus.append({
            'taille': t,
            'frequence': round(f, 6),
            'theorique': round(1 / 6, 6),
            'difference': round(abs(f - 1 / 6), 6),
        })

    # Initialisation des sessions si necessaire
    request.session.setdefault('total_lancers', 0)
    request.session.setdefault('total_egaux', 0)
    session_freq = 0
    if request.session['total_lancers'] > 0:
        session_freq = round(
            request.session['total_egaux'] / request.session['total_lancers'], 6
        )

    context = {
        'lancers_bruts': lancers_bruts,
        'simulations': simus,
        'probabilite_theorique': round(1 / 6, 6),
        'session_total': request.session['total_lancers'],
        'session_egaux': request.session['total_egaux'],
        'session_frequence': session_freq,
    }
    return render(request, 'simulation/home.html', context)


def api_lancer(request):
    """
    API AJAX : effectue un lancer et retourne le resultat en JSON.

    Met a jour les sessions pour le suivi des statistiques.

    Returns:
        JsonResponse: {
            'de1': int, 'de2': int, 'egaux': bool,
            'frequence': float
        }
    """
    des = lancer_des()
    egaux = test(des)

    # Mise a jour des sessions
    request.session['total_lancers'] = request.session.get('total_lancers', 0) + 1
    if egaux:
        request.session['total_egaux'] = request.session.get('total_egaux', 0) + 1

    total = request.session['total_lancers']
    egaux_total = request.session.get('total_egaux', 0)
    freq = round(egaux_total / total, 6) if total > 0 else 0

    return JsonResponse({
        'de1': des[0],
        'de2': des[1],
        'egaux': egaux,
        'frequence': freq,
        'total_lancers': total,
        'total_egaux': egaux_total,
    })


def cours_python(request):
    """
    Page de cours Python : gestion des exceptions et POO.
    """
    return render(request, 'simulation/cours_python.html')
