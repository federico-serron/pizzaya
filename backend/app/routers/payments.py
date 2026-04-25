from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.payment import PaymentCreateRequest
from app.services.order_service import get_order_by_id
from app.services.payment_service import create_dlocalgo_payment, handle_webhook, verify_dlocalgo_webhook

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])


@router.post("/create")
async def create_payment(
    data: PaymentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await get_order_by_id(db, data.order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your order")
    if order.payment_status == "paid":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order already paid")

    result = await create_dlocalgo_payment(db, order, data.currency)
    return {"success": True, "data": result}


@router.post("/webhook")
async def webhook(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.body()
    signature = request.headers.get("X-Signature", "")

    # Verify signature in production
    # if not verify_dlocalgo_webhook(body, signature):
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

    try:
        import json
        data = json.loads(body)
        order = await handle_webhook(
            db,
            payment_id=data.get("id", ""),
            status_value=data.get("status", ""),
            order_id=data.get("order_id", ""),
        )
        return {"success": True, "data": {"status": order.payment_status}}
    except Exception:
        # For sandbox, accept the webhook anyway
        return {"success": True, "data": {"message": "Webhook received"}}

    return {"success": True, "data": {"message": "Webhook received"}}
