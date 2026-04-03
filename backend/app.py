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

    # ✅ ROOT ROUTE ADD (VERY IMPORTANT)
    @app.route('/')
    def home():
        return "Backend Running 🚀"

    # ── Core config ──────────────────────────────────────────
    app.config['SECRET_KEY'] = 'talentbridge-secret-2024'
    app.config['JWT_SECRET_KEY'] = 'talentbridge-jwt-secret-2024'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

    # ── DB Config ────────────────────────────────────────────
    database_url = os.getenv("DATABASE_URL")

    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    app.config['SQLALCHEMY_DATABASE_URI'] = database_url

    # ── Extensions ───────────────────────────────────────────
    db.init_app(app)
    JWTManager(app)
    CORS(app)

    # ── Blueprints ───────────────────────────────────────────
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    app.register_blueprint(posts_bp, url_prefix='/api/posts')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(ml_bp, url_prefix='/api/ml')

    # ── Upload route ─────────────────────────────────────────
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # ── Init DB ──────────────────────────────────────────────
    with app.app_context():
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'profiles'), exist_ok=True)
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'resumes'), exist_ok=True)
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'posts'), exist_ok=True)

        try:
            db.create_all()
            print("✅ Database Connected!")
        except Exception as e:
            print("❌ DB Error:", e)
            raise

    return app


# ✅ gunicorn uses this
app = create_app()


# ✅ local run
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

    app = create_app()