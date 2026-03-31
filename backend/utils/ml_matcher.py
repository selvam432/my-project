"""
ML-based job matching using TF-IDF cosine similarity and skill overlap scoring.
Combines textual similarity with exact skill matching for robust predictions.
"""
import os
import re
import numpy as np

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

try:
    import PyPDF2
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text content from a PDF file."""
    if not PYPDF2_AVAILABLE or not pdf_path or not os.path.exists(pdf_path):
        return ''
    try:
        text = ''
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() or ''
        return text
    except Exception:
        return ''


def parse_skills(skills_str: str) -> list:
    """Parse comma-separated or newline-separated skills into a list."""
    if not skills_str:
        return []
    # Split on comma, semicolon, or newline
    skills = re.split(r'[,;\n]+', skills_str)
    return [s.strip().lower() for s in skills if s.strip()]


def skill_overlap_score(candidate_skills: list, job_skills: list) -> float:
    """
    Compute Jaccard-like skill overlap score.
    Returns a value between 0.0 and 1.0.
    """
    if not job_skills:
        return 0.5  # neutral if no skills specified

    candidate_set = set(candidate_skills)
    job_set = set(job_skills)

    if not candidate_set:
        return 0.0

    matched = candidate_set.intersection(job_set)
    # Weighted: what fraction of required skills does candidate have?
    coverage = len(matched) / len(job_set)
    return min(coverage, 1.0)


def tfidf_similarity(text1: str, text2: str) -> float:
    """
    Compute TF-IDF cosine similarity between two texts.
    Returns 0.0 to 1.0.
    """
    if not SKLEARN_AVAILABLE or not text1 or not text2:
        return 0.0
    try:
        vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform([text1, text2])
        score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(score)
    except Exception:
        return 0.0


def fuzzy_skill_match(candidate_skills: list, job_skills: list) -> float:
    """
    Check partial/fuzzy skill matches (e.g. 'react' in 'reactjs').
    Returns fraction of job skills with at least a partial match.
    """
    if not job_skills:
        return 0.5
    if not candidate_skills:
        return 0.0

    matched = 0
    for job_skill in job_skills:
        for cand_skill in candidate_skills:
            if job_skill in cand_skill or cand_skill in job_skill:
                matched += 1
                break

    return matched / len(job_skills)


def compute_match_score(
    candidate_skills_str: str,
    job_skills_str: str,
    resume_path: str = ''
) -> float:
    """
    Compute overall match score (0–100) combining:
    - Exact skill overlap (40%)
    - Fuzzy skill match (20%)
    - Resume text vs job skills TF-IDF similarity (40%)

    Returns a float between 0 and 100.
    """
    candidate_skills = parse_skills(candidate_skills_str)
    job_skills = parse_skills(job_skills_str)

    # Component 1: Exact skill overlap
    exact_score = skill_overlap_score(candidate_skills, job_skills)

    # Component 2: Fuzzy skill match
    fuzzy_score = fuzzy_skill_match(candidate_skills, job_skills)

    # Component 3: Resume TF-IDF vs job skills
    resume_text = extract_text_from_pdf(resume_path) if resume_path else ''
    if not resume_text:
        # fallback: use candidate skills as text
        resume_text = ' '.join(candidate_skills)
    job_text = ' '.join(job_skills) + ' ' + job_skills_str

    tfidf_score = tfidf_similarity(resume_text, job_text)

    # Weighted combination
    if SKLEARN_AVAILABLE:
        combined = (
            0.40 * exact_score +
            0.20 * fuzzy_score +
            0.40 * tfidf_score
        )
    else:
        # fallback without sklearn
        combined = (
            0.60 * exact_score +
            0.40 * fuzzy_score
        )

    # Scale to 0-100 with slight dampening (max practical is ~85)
    score = combined * 100
    # Add a small base score if any skills matched
    if exact_score > 0 or fuzzy_score > 0:
        score = max(score, 5.0)

    return round(min(score, 100.0), 2)


def get_skill_breakdown(candidate_skills_str: str, job_skills_str: str) -> dict:
    """
    Detailed breakdown of skill matching for HR display.
    """
    candidate_skills = parse_skills(candidate_skills_str)
    job_skills = parse_skills(job_skills_str)

    matched = []
    missing = []
    extra = []

    for skill in job_skills:
        found = False
        for cskill in candidate_skills:
            if skill == cskill or skill in cskill or cskill in skill:
                matched.append(skill)
                found = True
                break
        if not found:
            missing.append(skill)

    candidate_set = set(candidate_skills)
    job_set = set(job_skills)
    extra = list(candidate_set - job_set)

    return {
        'matched_skills': matched,
        'missing_skills': missing,
        'extra_skills': extra[:10],  # limit for display
        'match_percentage': round(len(matched) / len(job_skills) * 100 if job_skills else 0, 1)
    }
