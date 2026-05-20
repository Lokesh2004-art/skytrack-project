from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

from sqlalchemy import inspect

from .routes.flights import flights_bp
from .routes.auth import auth_bp
from .routes.analytics import analytics_bp
from .routes.weather import weather_bp
from .db import Base, create_db_engine, create_session_factory
from .models import User


def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "skytrack-dev-secret")

    # CORS for local dev (frontend -> backend)
    CORS(app)

    # DB connection: MySQL if configured, otherwise local SQLite fallback.
    engine = create_db_engine()

    # If an older SQLite schema exists (e.g. BIGINT PK), reset users table to avoid NOT NULL id.
    if engine.dialect.name == "sqlite":
        try:
            insp = inspect(engine)
            if insp.has_table("users"):
                cols = insp.get_columns("users")
                id_col = next((c for c in cols if c.get("name") == "id"), None)
                # SQLite autoincrement requires INTEGER PRIMARY KEY.
                if id_col and id_col.get("type").__class__.__name__.lower() != "integer":
                    User.__table__.drop(engine)
        except Exception:
            pass

    Base.metadata.create_all(bind=engine)
    app.extensions["db_session_factory"] = create_session_factory(engine)

    app.register_blueprint(flights_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(weather_bp)

    @app.get("/health")
    def health():
        return {"success": True, "data": {"status": "ok"}}

    return app
