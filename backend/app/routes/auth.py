from __future__ import annotations

from flask import Blueprint, current_app, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from sqlalchemy import select
from werkzeug.security import check_password_hash, generate_password_hash

from ..db import db_session
from ..models import User


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

_DEMO_EMAIL = "demo@skytrack.ai"
_DEMO_PASSWORD = "demo123"
def _serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(current_app.config.get("SECRET_KEY", "skytrack-dev-secret"))


def _issue_token(user_id: int) -> str:
    return _serializer().dumps({"uid": int(user_id)})


def _user_id_from_token(token: str) -> int | None:
    token = (token or "").strip()
    if not token:
        return None

    # Back-compat for older demo token
    if token == "demo-token":
        return -1

    try:
        data = _serializer().loads(token, max_age=60 * 60 * 24 * 30)  # 30 days
        uid = int(data.get("uid"))
        return uid
    except (BadSignature, SignatureExpired, ValueError, TypeError, AttributeError):
        return None


def _db_session_factory():
    return current_app.extensions.get("db_session_factory")


@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    # Allow demo account even without DB.
    if email == _DEMO_EMAIL and password == _DEMO_PASSWORD:
        return {
            "success": True,
            "data": {
                "token": "demo-token",
                "user": {"email": _DEMO_EMAIL, "name": "Demo User"},
            },
        }

    session_factory = _db_session_factory()
    if not session_factory:
        return {
            "success": False,
            "error": {"code": "SERVER_ERROR", "message": "Database session not available"},
        }, 500

    with db_session(session_factory) as session:
        user = session.execute(select(User).where(User.email == email)).scalar_one_or_none()

        if not user or not check_password_hash(user.password_hash, password):
            return {
                "success": False,
                "error": {"code": "INVALID_CREDENTIALS", "message": "Invalid email or password"},
            }, 401

        return {
            "success": True,
            "data": {
                "token": _issue_token(user.id),
                "user": {"email": user.email, "name": user.name},
            },
        }


@auth_bp.post("/signup")
def signup():
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    name = (payload.get("name") or "").strip()

    # Demo-only validation
    if not email or "@" not in email:
        return {
            "success": False,
            "error": {"code": "INVALID_EMAIL", "message": "Invalid email"},
        }, 400

    if len(password) < 4:
        return {
            "success": False,
            "error": {"code": "WEAK_PASSWORD", "message": "Password too short"},
        }, 400

    if email == _DEMO_EMAIL:
        return {
            "success": False,
            "error": {"code": "EMAIL_TAKEN", "message": "Email already exists"},
        }, 409

    session_factory = _db_session_factory()
    if not session_factory:
        return {
            "success": False,
            "error": {"code": "SERVER_ERROR", "message": "Database session not available"},
        }, 500

    with db_session(session_factory) as session:
        exists = session.execute(select(User.id).where(User.email == email)).scalar_one_or_none()
        if exists:
            return {
                "success": False,
                "error": {"code": "EMAIL_TAKEN", "message": "Email already exists"},
            }, 409

        user = User(
            name=name or "New User",
            email=email,
            password_hash=generate_password_hash(password),
        )
        session.add(user)
        session.flush()  # get user.id

        return {
            "success": True,
            "data": {
                "token": _issue_token(user.id),
                "user": {"email": user.email, "name": user.name},
            },
        }


@auth_bp.get("/me")
def me():
    auth = request.headers.get("Authorization") or ""
    token = auth.replace("Bearer", "").strip()

    uid = _user_id_from_token(token)
    if uid is None:
        return {
            "success": False,
            "error": {"code": "UNAUTHORIZED", "message": "Missing or invalid token"},
        }, 401

    # Demo token path
    if uid == -1:
        return {
            "success": True,
            "data": {"email": _DEMO_EMAIL, "name": "Demo User"},
        }

    session_factory = _db_session_factory()
    if not session_factory:
        return {
            "success": False,
            "error": {"code": "SERVER_ERROR", "message": "Database session not available"},
        }, 500

    with db_session(session_factory) as session:
        user = session.get(User, uid)
        if not user:
            return {
                "success": False,
                "error": {"code": "UNAUTHORIZED", "message": "Missing or invalid token"},
            }, 401

    return {
        "success": True,
        "data": {"email": user.email, "name": user.name},
    }
