from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import User
import os
import uuid
from werkzeug.utils import secure_filename

profile_bp = Blueprint('profile', __name__)

ALLOWED_IMG = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
ALLOWED_DOC = {'pdf', 'doc', 'docx'}

def allowed_img(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_IMG

def allowed_doc(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_DOC


@profile_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_profile(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200


@profile_bp.route('/update', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    updatable = ['full_name', 'bio', 'skills', 'company', 'location']
    for field in updatable:
        if field in data:
            setattr(user, field, data[field])

    db.session.commit()
    return jsonify(user.to_dict()), 200


@profile_bp.route('/upload-pic', methods=['POST'])
@jwt_required()
def upload_pic():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    if 'file' not in request.files:
        return jsonify({'error': 'No file'}), 400

    file = request.files['file']
    if not file or not allowed_img(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    filename = str(uuid.uuid4()) + '_' + secure_filename(file.filename)
    upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'profiles')
    os.makedirs(upload_dir, exist_ok=True)
    file.save(os.path.join(upload_dir, filename))

    user.profile_pic = f'profiles/{filename}'
    db.session.commit()
    return jsonify({'profile_pic': user.profile_pic}), 200


@profile_bp.route('/upload-resume', methods=['POST'])
@jwt_required()
def upload_resume():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    if 'file' not in request.files:
        return jsonify({'error': 'No file'}), 400

    file = request.files['file']
    if not file or not allowed_doc(file.filename):
        return jsonify({'error': 'Invalid file type. PDF or Word only.'}), 400

    filename = str(uuid.uuid4()) + '_' + secure_filename(file.filename)
    upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'resumes')
    os.makedirs(upload_dir, exist_ok=True)
    file.save(os.path.join(upload_dir, filename))

    user.resume_path = f'resumes/{filename}'
    db.session.commit()
    return jsonify({'resume_path': user.resume_path}), 200


@profile_bp.route('/seekers', methods=['GET'])
@jwt_required()
def get_seekers():
    seekers = User.query.filter_by(role='seeker').all()
    return jsonify([s.to_dict() for s in seekers]), 200
