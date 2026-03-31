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

# ============================================================
#  MYSQL DATABASE CONFIGURATION
#  Change only these values to match your MySQL setup:
# ============================================================
DB_USER     = "root"
DB_PASSWORD = ""          # ← PUT YOUR MYSQL PASSWORD HERE
                          #   If no password, leave it empty: ""
                          #   If password is 1234, write:    "1234"
                          #   If password is root, write:    "root"
DB_HOST     = "localhost"
DB_PORT     = "3306"
DB_NAME     = "jobportal"


def create_app():
    app = Flask(__name__)

    # ── Core config ──────────────────────────────────────────
    app.config['SECRET_KEY']                     = 'talentbridge-secret-2024'
    app.config['JWT_SECRET_KEY']                 = 'talentbridge-jwt-secret-2024'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER']                  = os.path.join(os.path.dirname(__file__), 'uploads')
    app.config['MAX_CONTENT_LENGTH']             = 16 * 1024 * 1024  # 16 MB

    # ── MySQL connection URI ──────────────────────────────────
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        f"?charset=utf8mb4"
    )

    # ── Extensions ───────────────────────────────────────────
    db.init_app(app)
    JWTManager(app)
    CORS(app,
         resources={r"/api/*": {"origins": ["http://localhost:5173",
                                             "http://127.0.0.1:5173"]}},
         supports_credentials=True)

    # ── Register blueprints ───────────────────────────────────
    app.register_blueprint(auth_bp,    url_prefix='/api/auth')
    app.register_blueprint(jobs_bp,    url_prefix='/api/jobs')
    app.register_blueprint(posts_bp,   url_prefix='/api/posts')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(ml_bp,      url_prefix='/api/ml')

    # ── Serve uploaded files ──────────────────────────────────
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # ── Create MySQL tables on startup ────────────────────────
    with app.app_context():

        # Create upload folders if not exist
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'profiles'), exist_ok=True)
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'resumes'),  exist_ok=True)
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'posts'),    exist_ok=True)

        try:
            db.create_all()
            print("\n" + "=" * 55)
            print("  ✅  MySQL Connected & Tables Created!")
            print(f"  📦  Database  :  {DB_NAME}")
            print(f"  🖥️   Host      :  {DB_HOST}:{DB_PORT}")
            print(f"  👤  User      :  {DB_USER}")
            print("  📋  Tables    :  users, jobs, posts, applications")
            print("=" * 55 + "\n")
        except Exception as e:
            print("\n" + "=" * 55)
            print("  ❌  MySQL Connection FAILED!")
            print(f"  Error : {e}")
            print("\n  Fix steps:")
            print("  1. Open app.py and correct DB_PASSWORD")
            print("  2. Make sure MySQL is running")
            print("  3. Create database: CREATE DATABASE jobportal;")
            print("=" * 55 + "\n")
            raise

    return app


if __name__ == '__main__':
    app = create_app()
    
    import os
    port = int(os.environ.get("PORT", 5000))
    
    app.run(host="0.0.0.0", port=port)
