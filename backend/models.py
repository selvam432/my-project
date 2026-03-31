from extensions import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash


# ────────────────────────────────────────────────────────────
#  USER TABLE
#  Stores both Job Seekers and HR/Recruiters
# ────────────────────────────────────────────────────────────
class User(db.Model):
    __tablename__ = 'users'

    id           = db.Column(db.Integer,      primary_key=True, autoincrement=True)
    email        = db.Column(db.String(150),  unique=True, nullable=False)
    password_hash= db.Column(db.String(256),  nullable=False)
    role         = db.Column(db.String(20),   nullable=False)   # 'seeker' or 'hr'
    full_name    = db.Column(db.String(150),  nullable=False)
    bio          = db.Column(db.Text,         default='')
    skills       = db.Column(db.Text,         default='')       # comma-separated
    profile_pic  = db.Column(db.String(300),  default='')
    resume_path  = db.Column(db.String(300),  default='')
    company      = db.Column(db.String(150),  default='')       # for HR
    location     = db.Column(db.String(150),  default='')
    created_at   = db.Column(db.DateTime,     default=datetime.utcnow)

    # Relationships
    posts        = db.relationship('Post',        backref='author',    lazy=True, cascade='all, delete-orphan')
    applications = db.relationship('Application', backref='applicant', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id':           self.id,
            'email':        self.email,
            'role':         self.role,
            'full_name':    self.full_name,
            'bio':          self.bio          or '',
            'skills':       self.skills       or '',
            'profile_pic':  self.profile_pic  or '',
            'resume_path':  self.resume_path  or '',
            'company':      self.company      or '',
            'location':     self.location     or '',
            'created_at':   self.created_at.isoformat()
        }


# ────────────────────────────────────────────────────────────
#  JOBS TABLE
#  Created by HR, viewed and applied by Job Seekers
# ────────────────────────────────────────────────────────────
class Job(db.Model):
    __tablename__ = 'jobs'

    id              = db.Column(db.Integer,     primary_key=True, autoincrement=True)
    title           = db.Column(db.String(200), nullable=False)
    company         = db.Column(db.String(150), nullable=False)
    location        = db.Column(db.String(150), default='')
    description     = db.Column(db.Text,        nullable=False)
    requirements    = db.Column(db.Text,        default='')
    skills_required = db.Column(db.Text,        default='')     # comma-separated
    salary_range    = db.Column(db.String(100), default='')
    job_type        = db.Column(db.String(50),  default='Full-time')
    is_active       = db.Column(db.Boolean,     default=True)
    created_at      = db.Column(db.DateTime,    default=datetime.utcnow)
    hr_id           = db.Column(db.Integer,     db.ForeignKey('users.id'), nullable=False)

    # Relationships
    hr           = db.relationship('User',        foreign_keys=[hr_id], backref='jobs')
    applications = db.relationship('Application', backref='job', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id':                 self.id,
            'title':              self.title,
            'company':            self.company,
            'location':           self.location        or '',
            'description':        self.description,
            'requirements':       self.requirements    or '',
            'skills_required':    self.skills_required or '',
            'salary_range':       self.salary_range    or '',
            'job_type':           self.job_type,
            'is_active':          self.is_active,
            'created_at':         self.created_at.isoformat(),
            'hr_id':              self.hr_id,
            'applications_count': len(self.applications)
        }


# ────────────────────────────────────────────────────────────
#  POSTS TABLE
#  Social feed posts by any user (seeker or HR)
# ────────────────────────────────────────────────────────────
class Post(db.Model):
    __tablename__ = 'posts'

    id         = db.Column(db.Integer,     primary_key=True, autoincrement=True)
    content    = db.Column(db.Text,        nullable=False)
    image_path = db.Column(db.String(300), default='')
    likes      = db.Column(db.Integer,     default=0)
    created_at = db.Column(db.DateTime,    default=datetime.utcnow)
    user_id    = db.Column(db.Integer,     db.ForeignKey('users.id'), nullable=False)

    def to_dict(self):
        return {
            'id':          self.id,
            'content':     self.content,
            'image_path':  self.image_path or '',
            'likes':       self.likes,
            'created_at':  self.created_at.isoformat(),
            'user_id':     self.user_id,
            'author_name': self.author.full_name,
            'author_pic':  self.author.profile_pic or '',
            'author_role': self.author.role
        }


# ────────────────────────────────────────────────────────────
#  APPLICATIONS TABLE
#  Tracks job applications with ML match score
# ────────────────────────────────────────────────────────────
class Application(db.Model):
    __tablename__ = 'applications'

    id           = db.Column(db.Integer,    primary_key=True, autoincrement=True)
    job_id       = db.Column(db.Integer,    db.ForeignKey('jobs.id'),  nullable=False)
    user_id      = db.Column(db.Integer,    db.ForeignKey('users.id'), nullable=False)
    cover_letter = db.Column(db.Text,       default='')
    ml_score     = db.Column(db.Float,      default=0.0)        # AI match score 0-100
    status       = db.Column(db.String(50), default='pending')  # pending/reviewed/accepted/rejected
    applied_at   = db.Column(db.DateTime,   default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':           self.id,
            'job_id':       self.job_id,
            'user_id':      self.user_id,
            'cover_letter': self.cover_letter or '',
            'ml_score':     self.ml_score,
            'status':       self.status,
            'applied_at':   self.applied_at.isoformat(),
            'applicant':    self.applicant.to_dict(),
            'job':          self.job.to_dict()
        }
