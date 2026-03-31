from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Job
from utils.ml_matcher import compute_match_score, get_skill_breakdown
import os

ml_bp = Blueprint('ml', __name__)


@ml_bp.route('/match', methods=['POST'])
@jwt_required()
def match():
    """Compute match score between a seeker and a job."""
    data = request.get_json()
    job_id = data.get('job_id')
    user_id = data.get('user_id') or int(get_jwt_identity())

    user = User.query.get_or_404(user_id)
    job = Job.query.get_or_404(job_id)

    resume_full_path = ''
    if user.resume_path:
        from flask import current_app
        resume_full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], user.resume_path)

    score = compute_match_score(user.skills, job.skills_required, resume_full_path)
    breakdown = get_skill_breakdown(user.skills, job.skills_required)

    return jsonify({
        'score': score,
        'breakdown': breakdown,
        'candidate': user.full_name,
        'job_title': job.title
    }), 200


@ml_bp.route('/analyze-applicant', methods=['POST'])
@jwt_required()
def analyze_applicant():
    """HR: analyze a specific applicant for a job."""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get_or_404(current_user_id)

    if current_user.role != 'hr':
        return jsonify({'error': 'HR only'}), 403

    data = request.get_json()
    applicant_id = data.get('applicant_id')
    job_id = data.get('job_id')

    applicant = User.query.get_or_404(applicant_id)
    job = Job.query.get_or_404(job_id)

    resume_full_path = ''
    if applicant.resume_path:
        from flask import current_app
        resume_full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], applicant.resume_path)

    score = compute_match_score(applicant.skills, job.skills_required, resume_full_path)
    breakdown = get_skill_breakdown(applicant.skills, job.skills_required)

    # Prediction label
    if score >= 70:
        prediction = 'Highly Suitable'
        color = 'green'
    elif score >= 45:
        prediction = 'Moderately Suitable'
        color = 'yellow'
    else:
        prediction = 'Low Suitability'
        color = 'red'

    return jsonify({
        'score': score,
        'prediction': prediction,
        'prediction_color': color,
        'breakdown': breakdown,
        'candidate': applicant.to_dict(),
        'job_title': job.title
    }), 200
