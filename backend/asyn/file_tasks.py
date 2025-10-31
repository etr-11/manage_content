# backend/async/file_tasks.py

from celery import Celery
from auth.config import REDIS_URL
from werkzeug.utils import secure_filename
import os

celery_app = Celery('file_tasks', broker=REDIS_URL)

@celery_app.task
def process_file(temp_path: str, filename: str):
    secure_name = secure_filename(filename)
    final_path = os.path.join('uploads', secure_name)
    os.makedirs('uploads', exist_ok=True)
    os.rename(temp_path, final_path)
    return {"status": "done", "path": final_path}