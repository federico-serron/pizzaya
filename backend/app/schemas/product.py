from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    slug: str
    description: str | None = None
    price: Decimal
    image_url: str | None = None
    category_id: str
    is_available: bool = True
    is_featured: bool = False


class ProductUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    price: Decimal | None = None
    image_url: str | None = None
    category_id: str | None = None
    is_available: bool | None = None
    is_featured: bool | None = None


class ProductResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None
    price: Decimal
    image_url: str | None
    category_id: str
    is_available: bool
    is_featured: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
