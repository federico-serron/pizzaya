import hashlib
import hmac
import json

import httpx
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.order import Order


async def create_dlocalgo_payment(
    db: AsyncSession,
    order: Order,
    currency: str = "UYU",
) -> dict:
    payload = {
        "amount": float(order.total),
        "currency": currency,
        "country": "UY",
        "order_id": order.id,
        "description": f"PizzaYA - Orden #{order.id[:8]}",
        "notification_url": f"{settings.FRONTEND_URL}/api/v1/payments/webhook",
        "payer": {
            "name": "Customer",
            "email": "customer@pizzaya.com.uy",
        },
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.DLOCALGO_BASE_URL}/api/payments",
            json=payload,
            headers={
                "X-Date": "",  # would be set in production
                "X-Login": settings.DLOCALGO_API_KEY,
                "X-Trans-Key": settings.DLOCALGO_SECRET_KEY,
                "Content-Type": "application/json",
            },
        )
        if response.status_code not in (200, 201):
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Payment provider error")

        data = response.json()
        order.payment_id = data.get("id")
        await db.flush()

        return data


def verify_dlocalgo_webhook(body: bytes, signature: str) -> bool:
    expected = hmac.new(
        settings.DLOCALGO_SECRET_KEY.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


async def handle_webhook(
    db: AsyncSession,
    payment_id: str,
    status_value: str,
    order_id: str,
) -> Order:
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    status_map = {
        "PAID": "paid",
        "REJECTED": "failed",
        "CANCELLED": "failed",
        "REFUNDED": "refunded",
        "PENDING": "pending",
    }

    payment_status = status_map.get(status_value, "pending")
    order.payment_status = payment_status
    order.payment_id = payment_id

    if payment_status == "paid":
        order.status = "confirmed"

    await db.flush()
    await db.refresh(order)
    return order
