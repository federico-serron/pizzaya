from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.routers.cart import get_or_create_cart
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order_service import create_order_from_cart, get_order_by_id, get_user_orders

router = APIRouter(prefix="/api/v1/orders", tags=["orders"])


@router.get("")
async def list_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    orders, total = await get_user_orders(db, current_user.id, page=page, limit=limit)
    return {
        "success": True,
        "data": [OrderResponse.model_validate(o).model_dump() for o in orders],
        "pagination": {"page": page, "limit": limit, "total": total, "pages": max(1, (total + limit - 1) // limit)},
    }


@router.get("/{order_id}")
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your order")
    return {"success": True, "data": OrderResponse.model_validate(order).model_dump()}


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cart_items = get_or_create_cart(current_user.id)
    if not cart_items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    from app.routers.cart import cart_store

    order = await create_order_from_cart(db, current_user, cart_items, order_data)
    cart_store[current_user.id] = []

    return {"success": True, "data": OrderResponse.model_validate(order).model_dump()}
