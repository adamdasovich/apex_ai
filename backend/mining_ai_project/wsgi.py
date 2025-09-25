# backend/mining_ai_project/wsgi.py
"""
WSGI config for mining_ai_project project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mining_ai_project.settings.base')

application = get_wsgi_application()