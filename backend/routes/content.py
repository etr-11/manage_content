# backend/routes/content.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from typing import List

# АБСОЛЮТНЫЕ ИМПОРТЫ (от корня /app)
from models.models import Content as ContentModel, User
from schemas.schemas import ContentOut
from auth.auth import get_current_user
from auth.database import SessionLocal
from auth.config import SECRET_KEY, ALGORITHM, MAX_FILE_SIZE
from analytics.analytics import analyze_content
from asyn.file_tasks import process_file  # ← ИМПОРТ ЕСТЬ!
import os

router = APIRouter(prefix="/content", tags=["Content"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ContentOut)
async def create_content(
    title: str = Form(...),
    text: str = Form(...),
    file: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = analyze_content(text)
    
    content = ContentModel(
        title=title,
        text=text,
        is_safe=analysis["is_safe"],
        user_id=current_user.id
    )
    db.add(content)
    db.commit()
    db.refresh(content)

    response = {
        "id": content.id,
        "title": content.title,
        "text": content.text,
        "is_safe": content.is_safe,
        "user_id": content.user_id,
        "created_at": content.created_at.isoformat(),
        "file_path": None
    }

    if file:
        file_size = len(await file.read())
        await file.seek(0)
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        filename = file.filename
        temp_path = f"uploads/temp_{filename}"
        os.makedirs("uploads", exist_ok=True)
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        task = process_file.delay(temp_path, filename)
        content.file_path = task.id
        db.commit()
        response["file_path"] = task.id

    return response

@router.get("/", response_model=List[ContentOut])
async def get_user_content(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(ContentModel).filter(ContentModel.user_id == current_user.id).all()