# backend/models/models.py

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

# АБСОЛЮТНЫЙ ИМПОРТ
from auth.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    contents = relationship("Content", backref="user", lazy=True)

class Content(Base):
    __tablename__ = "content"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    text = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    is_safe = Column(Boolean, default=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)