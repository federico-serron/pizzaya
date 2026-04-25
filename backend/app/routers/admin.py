from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_admin
from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.schemas.order import OrderResponse
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services.order_service import get_all_orders, get_dashboard_stats, get_order_by_id, update_order_status

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


# Dashboard
@router.get("/dashboard")
async def dashboard(current_admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    stats = await get_dashboard_stats(db)
    return {"success": True, "data": stats}


# Products CRUD
@router.post("/products", status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate,
    current_admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    product = Product(**data.model_dump())
    db.add(product)
    await db.flush()
    await db.refresh(product)
    return {"success": True, "data": ProductResponse.model_validate(product).model_dump()}


@router.put("/products/{product_id}")
async def update_product(
    product_id: str,
    data: ProductUpdate,
    current_admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)

    await db.flush()
    await db.refresh(product)
    return {"success": True, "data": ProductResponse.model_validate(product).model_dump()}


@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    current_admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    await db.delete(product)
    await db.flush()
    return {"success": True, "data": {"message": "Product deleted"}}


@router.patch("/products/{product_id}/availability")
async def toggle_product_availability(
    product_id: str,
    current_admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    product.is_available = not product.is_available
    await db.flush()
    await db.refresh(product)
    return {"success": True, "data": ProductResponse.model_validate(product).model_dump()}


# Categories CRUD
@router.post("/categories", status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreate,
    current_admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    category = Category(**data.model_dump())
    db.add(category)
    await db.flush()
    await db.refresh(category)
    return {"success": True, "data": CategoryResponse.model_validate(category).model_dump()}


@router.put("/categories/{category_id}")
async def update_category(
    category_id: str,
    data: CategoryUpdate,
    current_admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)

    await db.flush()
    await db.refresh(category)
    return {"success": True, "data": CategoryResponse.model_validate(category).model_dump()}


@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: str,
    current_admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    prod_count = await db.execute(select(Product).where(Product.category_id == category_id))
    if prod_count.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete category with products")

    await db.delete(category)
    await db.flush()
    return {"success": True, "data": {"message": "Category deleted"}}


# Orders management
@router.get("/orders")
async def list_orders_admin(
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    orders, total = await get_all_orders(db, status=status, page=page, limit=limit)
    return {
        "success": True,
        "data": [OrderResponse.model_validate(o).model_dump() for o in orders],
        "pagination": {"page": page, "limit": limit, "total": total, "pages": max(1, (total + limit - 1) // limit)},
    }


@router.get("/orders/{order_id}")
async def get_order_admin(
    order_id: str,
    current_admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    order = await get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return {"success": True, "data": OrderResponse.model_validate(order).model_dump()}


@router.patch("/orders/{order_id}/status")
async def update_order_status_admin(
    order_id: str,
    new_status: str = Query(...),
    current_admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    order = await update_order_status(db, order_id, new_status)
    return {"success": True, "data": OrderResponse.model_validate(order).model_dump()}
