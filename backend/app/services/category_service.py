from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category


async def get_categories(db: AsyncSession, active_only: bool = True):
    query = select(Category).order_by(Category.display_order)
    if active_only:
        query = query.where(Category.is_active == True)
    result = await db.execute(query)
    return result.scalars().all()


async def get_category_by_slug(db: AsyncSession, slug: str):
    result = await db.execute(select(Category).where(Category.slug == slug))
    return result.scalar_one_or_none()
