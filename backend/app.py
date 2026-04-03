from flask import Flask, send_from_directory, jsonify
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

    # ── Secrets ───────────────────────────────────────────────
    app.config['SECRET_KEY']     = os.environ.get('SECRET_KEY', 'talentbridge-secret-2024')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'talentbridge-jwt-2024')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER']       = os.path.join(os.path.dirname(__file__), 'uploads')
    app.config['MAX_CONTENT_LENGTH']  = 16 * 1024 * 1024  # 16 MB

    # ── Database ──────────────────────────────────────────────
    # Render → set DATABASE_URL in Environment Variables like:
    # mysql+pymysql://username:password@hostname:3306/dbname
    database_url = os.environ.get('DATABASE_URL', 'postgresql://jobportal_user:LbiTarnlypH6N1JVmCrg3U4ACKNyFDsm@dpg-d76aokma2pns73ek6t10-a.oregon-postgres.render.com/jobportal_9jwf')

    if database_url:
        # Fix common Render URL prefixes
        if database_url.startswith('mysql://'):
            database_url = database_url.replace('mysql://', 'mysql+pymysql://', 1)
        elif database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    else:
        # Local development fallback
        DB_USER = os.environ.get('DB_USER', 'root')
        DB_PASS = os.environ.get('DB_PASSWORD', '')
        DB_HOST = os.environ.get('DB_HOST', 'localhost')
        DB_PORT = os.environ.get('DB_PORT', '3306')
        DB_NAME = os.environ.get('DB_NAME', 'jobportal')
        app.config['SQLALCHEMY_DATABASE_URI'] = (
            f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
        )

    # ── CORS — Allow ALL origins (fixes Vercel ↔ Render cross-origin) ──
    # This is the most important fix for "register failed" error
    CORS(app,
         origins="*",
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
         supports_credentials=False)

    # Handle OPTIONS preflight requests manually
    @app.before_request
    def handle_options():
        from flask import request
        if request.method == 'OPTIONS':
            response = app.make_default_options_response()
            response.headers['Access-Control-Allow-Origin']  = '*'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
            return response

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

    # ── Health check for Render ───────────────────────────────
    @app.route('/')
    def index():
        return jsonify({'status': 'ok', 'message': 'TalentBridge API running ✅'}), 200

    @app.route('/health')
    def health():
        return jsonify({'status': 'ok'}), 200

    # ── Create DB tables ──────────────────────────────────────
    with app.app_context():
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'profiles'), exist_ok=True)
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'resumes'),  exist_ok=True)
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'posts'),    exist_ok=True)

        try:
            db.create_all()
            print("✅  DB tables ready!")
        except Exception as e:
            print(f"❌  DB Error: {e}")
            raise

    return app


# Gunicorn entry point
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
