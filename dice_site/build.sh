#!/usr/bin/env bash
# Script de build pour Render
set -o errexit

echo "=== Installation des dependances ==="
pip install -r requirements.txt

echo "=== Migrations ==="
python manage.py migrate --noinput

echo "=== Collecte des fichiers statiques ==="
python manage.py collectstatic --noinput

echo "=== Build termine avec succes ==="
