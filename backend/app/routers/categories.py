from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.category import CategoryResponse
from app.services.category_service import get_categories, get_category_by_slug

router = APIRouter(prefix="/api/v1/categories", tags=["categories"])


@router.get("")
async def list_categories(db: AsyncSession = Depends(get_db)):
    categories = await get_categories(db)
    return {"success": True, "data": [CategoryResponse.model_validate(c).model_dump() for c in categories]}


@router.get("/{slug}")
async def get_category(slug: str, db: AsyncSession = Depends(get_db)):
    category = await get_category_by_slug(db, slug)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return {"success": True, "data": CategoryResponse.model_validate(category).model_dump()}
