from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Job, Application, User
from utils.ml_matcher import compute_match_score

jobs_bp = Blueprint('jobs', __name__)


@jobs_bp.route('/', methods=['GET'])
@jwt_required()
def get_jobs():
    jobs = Job.query.filter_by(is_active=True).order_by(Job.created_at.desc()).all()
    return jsonify([j.to_dict() for j in jobs]), 200


@jobs_bp.route('/<int:job_id>', methods=['GET'])
@jwt_required()
def get_job(job_id):
    job = Job.query.get_or_404(job_id)
    return jsonify(job.to_dict()), 200


@jobs_bp.route('/', methods=['POST'])
@jwt_required()
def create_job():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    if user.role != 'hr':
        return jsonify({'error': 'Only HR can create jobs'}), 403

    data = request.get_json()
    job = Job(
        title=data['title'],
        company=data.get('company', user.company),
        location=data.get('location', ''),
        description=data['description'],
        requirements=data.get('requirements', ''),
        skills_required=data.get('skills_required', ''),
        salary_range=data.get('salary_range', ''),
        job_type=data.get('job_type', 'Full-time'),
        hr_id=user_id
    )
    db.session.add(job)
    db.session.commit()
    return jsonify(job.to_dict()), 201


@jobs_bp.route('/<int:job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id):
    user_id = int(get_jwt_identity())
    job = Job.query.get_or_404(job_id)
    if job.hr_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    for field in ['title', 'company', 'location', 'description', 'requirements', 'skills_required', 'salary_range', 'job_type', 'is_active']:
        if field in data:
            setattr(job, field, data[field])
    db.session.commit()
    return jsonify(job.to_dict()), 200


@jobs_bp.route('/<int:job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    user_id = int(get_jwt_identity())
    job = Job.query.get_or_404(job_id)
    if job.hr_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    db.session.delete(job)
    db.session.commit()
    return jsonify({'message': 'Job deleted'}), 200


@jobs_bp.route('/<int:job_id>/apply', methods=['POST'])
@jwt_required()
def apply_job(job_id):
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    if user.role != 'seeker':
        return jsonify({'error': 'Only job seekers can apply'}), 403

    existing = Application.query.filter_by(job_id=job_id, user_id=user_id).first()
    if existing:
        return jsonify({'error': 'Already applied'}), 409

    job = Job.query.get_or_404(job_id)
    data = request.get_json() or {}

    # Compute ML score
    score = compute_match_score(user.skills, job.skills_required, user.resume_path)

    app = Application(
        job_id=job_id,
        user_id=user_id,
        cover_letter=data.get('cover_letter', ''),
        ml_score=score
    )
    db.session.add(app)
    db.session.commit()
    return jsonify({'message': 'Applied successfully', 'ml_score': score}), 201


@jobs_bp.route('/<int:job_id>/applications', methods=['GET'])
@jwt_required()
def get_applications(job_id):
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    job = Job.query.get_or_404(job_id)

    if user.role != 'hr' or job.hr_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    apps = Application.query.filter_by(job_id=job_id).order_by(Application.ml_score.desc()).all()
    return jsonify([a.to_dict() for a in apps]), 200


@jobs_bp.route('/my-jobs', methods=['GET'])
@jwt_required()
def my_jobs():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    if user.role != 'hr':
        return jsonify({'error': 'HR only'}), 403
    jobs = Job.query.filter_by(hr_id=user_id).order_by(Job.created_at.desc()).all()
    return jsonify([j.to_dict() for j in jobs]), 200


@jobs_bp.route('/my-applications', methods=['GET'])
@jwt_required()
def my_applications():
    user_id = int(get_jwt_identity())
    apps = Application.query.filter_by(user_id=user_id).order_by(Application.applied_at.desc()).all()
    return jsonify([a.to_dict() for a in apps]), 200


@jobs_bp.route('/applications/<int:app_id>/status', methods=['PUT'])
@jwt_required()
def update_application_status(app_id):
    user_id = int(get_jwt_identity())
    app = Application.query.get_or_404(app_id)
    job = Job.query.get_or_404(app.job_id)

    if job.hr_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    app.status = data.get('status', app.status)
    db.session.commit()
    return jsonify(app.to_dict()), 200
