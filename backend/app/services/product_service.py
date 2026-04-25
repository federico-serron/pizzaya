from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product


async def get_products(
    db: AsyncSession,
    category_slug: str | None = None,
    search: str | None = None,
    is_available: bool | None = None,
    is_featured: bool | None = None,
    page: int = 1,
    limit: int = 20,
):
    query = select(Product)

    if category_slug:
        from app.models.category import Category
        sub = select(Category.id).where(Category.slug == category_slug).scalar_subquery()
        query = query.where(Product.category_id.in_(sub))

    if is_available is not None:
        query = query.where(Product.is_available == is_available)
    else:
        query = query.where(Product.is_available == True)

    if is_featured is not None:
        query = query.where(Product.is_featured == is_featured)

    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))

    count_query = select(Product)
    # Apply same filters for count
    if category_slug:
        from app.models.category import Category
        sub = select(Category.id).where(Category.slug == category_slug).scalar_subquery()
        count_query = count_query.where(Product.category_id.in_(sub))
    if is_available is not None:
        count_query = count_query.where(Product.is_available == is_available)
    else:
        count_query = count_query.where(Product.is_available == True)
    if is_featured is not None:
        count_query = count_query.where(Product.is_featured == is_featured)
    if search:
        count_query = count_query.where(Product.name.ilike(f"%{search}%"))

    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    products = result.scalars().all()

    count_result = await db.execute(count_query)
    total = len(count_result.scalars().all())

    return products, total


async def get_product_by_slug(db: AsyncSession, slug: str):
    result = await db.execute(select(Product).where(Product.slug == slug))
    return result.scalar_one_or_none()


async def get_featured_products(db: AsyncSession, limit: int = 8):
    result = await db.execute(
        select(Product).where(Product.is_featured == True, Product.is_available == True).limit(limit)
    )
    return result.scalars().all()
