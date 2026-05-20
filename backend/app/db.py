from __future__ import annotations

import os
from contextlib import contextmanager
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


Base = declarative_base()


def _build_mysql_url() -> str | None:
    # Prefer a full SQLAlchemy URL if provided.
    url = os.getenv("MYSQL_URL")
    if url:
        return url

    host = os.getenv("MYSQL_HOST")
    database = os.getenv("MYSQL_DATABASE")
    user = os.getenv("MYSQL_USER")

    if not host or not database or not user:
        return None

    port = os.getenv("MYSQL_PORT", "3306")
    password = os.getenv("MYSQL_PASSWORD", "")

    # mysql+pymysql://user:pass@host:port/db
    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}?charset=utf8mb4"


def _build_sqlite_url() -> str:
    # Local persistence fallback so signup/login works without MySQL.
    # Stored at backend/skytrack.sqlite3 by default.
    explicit = os.getenv("SQLITE_PATH")
    if explicit:
        p = Path(explicit)
    else:
        p = Path(__file__).resolve().parents[1] / "skytrack.sqlite3"

    return f"sqlite+pysqlite:///{p.as_posix()}"


def create_db_engine():
    url = _build_mysql_url() or _build_sqlite_url()

    if url.startswith("sqlite"):
        return create_engine(
            url,
            future=True,
            connect_args={"check_same_thread": False},
        )

    return create_engine(url, pool_pre_ping=True, future=True)


def create_session_factory(engine):
    return sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


@contextmanager
def db_session(session_factory):
    session = session_factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
