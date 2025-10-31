from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ContentOut(BaseModel):
    id: int
    title: str
    text: str
    file_path: Optional[str] = None
    is_safe: bool
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True