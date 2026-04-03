from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from extensions import db
from routes.auth import auth_bp
from routes.jobs import jobs_bp
from routes.posts import posts_bp
from routes.profile import profile_bp
from routes.ml import ml_bp
import os

def create_app():
    app = Flask(__name__)

    # ── Core config — reads from Render Environment Variables ─
    app.config['SECRET_KEY']                     = os.environ.get('SECRET_KEY', 'talentbridge-secret-2024')
    app.config['JWT_SECRET_KEY']                 = os.environ.get('JWT_SECRET_KEY', 'talentbridge-jwt-2024')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER']                  = os.path.join(os.path.dirname(__file__), 'uploads')
    app.config['MAX_CONTENT_LENGTH']             = 16 * 1024 * 1024  # 16 MB

    # ── Database URI ──────────────────────────────────────────
    # Render provides DATABASE_URL as environment variable automatically
    # when you add a PostgreSQL or MySQL database to your service.
    # Format: mysql+pymysql://user:pass@host:port/dbname
    # OR for Render's internal DB: postgresql://user:pass@host/dbname
    #
    # We read DATABASE_URL from env. If not set, fall back to local MySQL.
    database_url = os.environ.get('DATABASE_URL', '')

    if database_url:
        # Render sometimes gives postgres:// — fix it to postgresql+pymysql
        # For MySQL on Render, it will be: mysql://... → mysql+pymysql://...
        if database_url.startswith('mysql://'):
            database_url = database_url.replace('mysql://', 'mysql+pymysql://', 1)
        elif database_url.startswith('postgres://'):
            # If using Render PostgreSQL instead
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    else:
        # Local development fallback
        DB_USER     = os.environ.get('DB_USER',     'root')
        DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
        DB_HOST     = os.environ.get('DB_HOST',     'localhost')
        DB_PORT     = os.environ.get('DB_PORT',     '3306')
        DB_NAME     = os.environ.get('DB_NAME',     'jobportal')
        app.config['SQLALCHEMY_DATABASE_URI'] = (
            f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
            f"?charset=utf8mb4"
        )

    # ── CORS — allow Vercel frontend + local dev ──────────────
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Add your Vercel URL from environment variable
    vercel_url = os.environ.get('FRONTEND_URL', '')
    if vercel_url:
        allowed_origins.append(vercel_url)
        # Also allow with/without trailing slash
        allowed_origins.append(vercel_url.rstrip('/'))

    CORS(app,
         resources={r"/api/*": {"origins": allowed_origins}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    # ── Extensions ───────────────────────────────────────────
    db.init_app(app)
    JWTManager(app)

    # ── Blueprints ───────────────────────────────────────────
    app.register_blueprint(auth_bp,    url_prefix='/api/auth')
    app.register_blueprint(jobs_bp,    url_prefix='/api/jobs')
    app.register_blueprint(posts_bp,   url_prefix='/api/posts')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(ml_bp,      url_prefix='/api/ml')

    # ── Serve uploaded files ──────────────────────────────────
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # ── Health check endpoint for Render ─────────────────────
    @app.route('/')
    def health():
        return {'status': 'ok', 'message': 'TalentBridge API is running'}, 200

    @app.route('/health')
    def health_check():
        return {'status': 'ok'}, 200

    # ── Create tables on startup ──────────────────────────────
    with app.app_context():
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'profiles'), exist_ok=True)
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'resumes'),  exist_ok=True)
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'posts'),    exist_ok=True)

        try:
            db.create_all()
            print("✅  Database tables created successfully!")
        except Exception as e:
            print(f"❌  Database error: {e}")
            raise

    return app


# ── Entry point for Render (uses gunicorn) ────────────────────
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
