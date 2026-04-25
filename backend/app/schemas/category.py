from datetime import datetime
from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: str | None = None
    image_url: str | None = None
    display_order: int = 0


class CategoryUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    image_url: str | None = None
    is_active: bool | None = None
    display_order: int | None = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None
    image_url: str | None
    is_active: bool
    display_order: int
    created_at: datetime
    updated_at: datetime
    products: list["ProductResponse"] = []

    model_config = {"from_attributes": True}


from app.schemas.product import ProductResponse
