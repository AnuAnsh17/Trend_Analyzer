"""
Vercel Serverless Function entrypoint.
Exports WSGI app, handler, and application to satisfy Vercel Python runtime.
"""
from app import app, handler, application

__all__ = ["app", "handler", "application"]
