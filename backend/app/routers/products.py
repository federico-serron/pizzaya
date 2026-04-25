from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.product import ProductResponse
from app.services.product_service import get_featured_products, get_product_by_slug, get_products

router = APIRouter(prefix="/api/v1/products", tags=["products"])


@router.get("")
async def list_products(
    category_slug: str | None = Query(None),
    search: str | None = Query(None),
    is_featured: bool | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    products, total = await get_products(db, category_slug=category_slug, search=search, is_featured=is_featured, page=page, limit=limit)
    return {
        "success": True,
        "data": [ProductResponse.model_validate(p).model_dump() for p in products],
        "pagination": {"page": page, "limit": limit, "total": total, "pages": (total + limit - 1) // limit},
    }


@router.get("/featured")
async def featured_products(limit: int = Query(8, ge=1), db: AsyncSession = Depends(get_db)):
    products = await get_featured_products(db, limit=limit)
    return {"success": True, "data": [ProductResponse.model_validate(p).model_dump() for p in products]}


@router.get("/{slug}", response_model=ProductResponse)
async def get_product(slug: str, db: AsyncSession = Depends(get_db)):
    product = await get_product_by_slug(db, slug)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product
