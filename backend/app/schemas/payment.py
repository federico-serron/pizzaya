from pydantic import BaseModel


class PaymentCreateRequest(BaseModel):
    order_id: str
    currency: str = "UYU"


class PaymentWebhookRequest(BaseModel):
    id: str
    status: str
    order_id: str
    currency: str
    amount: float
