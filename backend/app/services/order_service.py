import uuid
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate


async def create_order_from_cart(
    db: AsyncSession,
    user: User,
    cart_items: list[dict],
    order_data: OrderCreate,
) -> Order:
    if not cart_items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    total = Decimal("0")
    order_items = []

    for item in cart_items:
        result = await db.execute(select(Product).where(Product.id == item["product_id"]))
        product = result.scalar_one_or_none()
        if not product or not product.is_available:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Product {item['product_id']} not available")

        quantity = item["quantity"]
        subtotal = product.price * quantity
        total += subtotal

        order_items.append(OrderItem(
            id=str(uuid.uuid4()),
            product_id=product.id,
            product_name=product.name,
            quantity=quantity,
            unit_price=product.price,
            subtotal=subtotal,
        ))

    order = Order(
        id=str(uuid.uuid4()),
        user_id=user.id,
        total=total,
        pickup_time=order_data.pickup_time,
        notes=order_data.notes,
        status="pending",
        payment_status="pending",
        items=order_items,
    )

    db.add(order)
    await db.flush()
    await db.refresh(order)
    return order


async def get_user_orders(db: AsyncSession, user_id: str, page: int = 1, limit: int = 20):
    query = select(Order).where(Order.user_id == user_id).order_by(Order.created_at.desc())
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    orders = result.scalars().all()

    count_query = select(func.count()).select_from(Order).where(Order.user_id == user_id)
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return orders, total


async def get_order_by_id(db: AsyncSession, order_id: str):
    result = await db.execute(select(Order).where(Order.id == order_id))
    return result.scalar_one_or_none()


async def get_all_orders(db: AsyncSession, status: str | None = None, page: int = 1, limit: int = 20):
    query = select(Order).order_by(Order.created_at.desc())
    if status:
        query = query.where(Order.status == status)
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    orders = result.scalars().all()

    count_query = select(func.count()).select_from(Order)
    if status:
        count_query = count_query.where(Order.status == status)
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return orders, total


async def update_order_status(db: AsyncSession, order_id: str, new_status: str):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    valid_transitions = {
        "pending": ["confirmed", "cancelled"],
        "confirmed": ["preparing", "cancelled"],
        "preparing": ["ready", "cancelled"],
        "ready": ["completed", "cancelled"],
        "completed": [],
        "cancelled": [],
    }

    if new_status not in valid_transitions.get(order.status, []):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot transition from {order.status} to {new_status}")

    order.status = new_status
    await db.flush()
    await db.refresh(order)
    return order


async def get_dashboard_stats(db: AsyncSession):
    from datetime import datetime, timezone

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    orders_today = await db.execute(
        select(func.count()).select_from(Order).where(Order.created_at >= today_start)
    )
    total_orders_today = orders_today.scalar()

    revenue_today = await db.execute(
        select(func.coalesce(func.sum(Order.total), 0))
        .select_from(Order)
        .where(Order.created_at >= today_start, Order.payment_status == "paid")
    )
    total_revenue_today = revenue_today.scalar() or 0

    pending_orders = await db.execute(
        select(func.count()).select_from(Order).where(Order.status.in_(["pending", "confirmed", "preparing"]))
    )
    total_pending = pending_orders.scalar()

    return {
        "orders_today": total_orders_today,
        "revenue_today": float(total_revenue_today),
        "pending_orders": total_pending,
    }
