import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.order import OrderItem
from app.models.user import User

router = APIRouter(prefix="/api/v1/cart", tags=["cart"])

cart_store: dict[str, list[dict]] = {}


def get_or_create_cart(user_id: str) -> list[dict]:
    if user_id not in cart_store:
        cart_store[user_id] = []
    return cart_store[user_id]


@router.get("")
async def get_cart(current_user: User = Depends(get_current_user)):
    items = get_or_create_cart(current_user.id)
    return {"success": True, "data": {"items": items, "total_items": len(items)}}


@router.post("/items")
async def add_to_cart(
    product_id: str = None,
    name: str = None,
    price: float = None,
    quantity: int = 1,
    current_user: User = Depends(get_current_user),
):
    from fastapi import Body

    items = get_or_create_cart(current_user.id)

    for item in items:
        if item["product_id"] == product_id:
            item["quantity"] += quantity
            return {"success": True, "data": {"items": items}}

    items.append({
        "product_id": product_id,
        "name": name,
        "price": price,
        "quantity": quantity,
    })

    return {"success": True, "data": {"items": items}}


from pydantic import BaseModel as PydanticBaseModel


class CartItemBody(PydanticBaseModel):
    product_id: str
    name: str
    price: float
    quantity: int = 1


@router.put("/items")
async def add_item_body(
    body: CartItemBody,
    current_user: User = Depends(get_current_user),
):
    items = get_or_create_cart(current_user.id)
    for item in items:
        if item["product_id"] == body.product_id:
            item["quantity"] += body.quantity
            return {"success": True, "data": {"items": items}}

    items.append({
        "product_id": body.product_id,
        "name": body.name,
        "price": body.price,
        "quantity": body.quantity,
    })
    return {"success": True, "data": {"items": items}}


@router.patch("/items/{product_id}")
async def update_cart_item(
    product_id: str,
    quantity: int = 1,
    current_user: User = Depends(get_current_user),
):
    items = get_or_create_cart(current_user.id)
    for item in items:
        if item["product_id"] == product_id:
            item["quantity"] = quantity
            if quantity <= 0:
                items.remove(item)
            return {"success": True, "data": {"items": items}}

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not in cart")


@router.delete("/items/{product_id}")
async def remove_cart_item(
    product_id: str,
    current_user: User = Depends(get_current_user),
):
    items = get_or_create_cart(current_user.id)
    items[:] = [i for i in items if i["product_id"] != product_id]
    return {"success": True, "data": {"items": items}}


@router.delete("")
async def clear_cart(current_user: User = Depends(get_current_user)):
    cart_store[current_user.id] = []
    return {"success": True, "data": {"message": "Cart cleared"}}
