try:
    # When running from workspace root: `python backend/run.py`
    from backend.app import create_app
except Exception:  # pragma: no cover
    # When running from backend dir: `python run.py`
    from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
