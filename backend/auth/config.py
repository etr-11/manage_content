import os
from datetime import timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 2
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@db:5432/projectsw")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 10485760))  # 10MB