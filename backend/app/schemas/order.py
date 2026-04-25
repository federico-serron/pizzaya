from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    pickup_time: datetime | None = None
    notes: str | None = None


class OrderResponse(BaseModel):
    id: str
    user_id: str
    status: str
    total: Decimal
    pickup_time: datetime | None
    notes: str | None
    payment_status: str
    payment_id: str | None
    items: list[OrderItemResponse]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
