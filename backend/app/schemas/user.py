from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str | None = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    phone: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
