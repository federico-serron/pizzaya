"""
Tests for the product endpoints (public, no auth required).

Endpoints covered
-----------------
GET  /api/v1/products                – list / filter / paginate
GET  /api/v1/products/featured       – featured products
GET  /api/v1/products/{slug}         – single product by slug
"""

import pytest
from decimal import Decimal

from tests.conftest import get_test_session_factory, seed_categories_and_products


# ===================================================================
# Fixture-like setup helper so each test can seed data easily.
# ===================================================================
async def _seed() -> tuple:
    """Insert a category + 2 products; return (cat, prod1, prod2)."""
    from app.models.category import Category
    from app.models.product import Product

    factory = get_test_session_factory()
    async with factory() as session:
        cat = Category(name="Pizzas", slug="pizzas", display_order=1)
        session.add(cat)
        await session.flush()

        p1 = Product(
            name="Muzzarella",
            slug="muzzarella",
            price=Decimal("380.00"),
            category_id=cat.id,
            is_featured=True,
            is_available=True,
        )
        p2 = Product(
            name="Napolitana",
            slug="napolitana",
            price=Decimal("420.00"),
            category_id=cat.id,
            is_featured=False,
            is_available=True,
        )
        session.add_all([p1, p2])
        await session.commit()

        await session.refresh(cat)
        await session.refresh(p1)
        await session.refresh(p2)
        return cat, p1, p2


# ===================================================================
# LIST PRODUCTS
# ===================================================================
async def test_list_products(async_client):
    """Listing products returns all available products with pagination."""
    await _seed()

    resp = await async_client.get("/api/v1/products")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert len(body["data"]) == 2
    assert body["pagination"]["total"] == 2
    assert body["pagination"]["page"] == 1
    assert body["pagination"]["limit"] == 20

    # Spot-check one product
    names = [p["name"] for p in body["data"]]
    assert "Muzzarella" in names
    assert "Napolitana" in names


async def test_list_products_empty(async_client):
    """Listing products with an empty DB returns an empty list."""
    resp = await async_client.get("/api/v1/products")
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] == []
    assert body["pagination"]["total"] == 0


async def test_list_products_by_category(async_client):
    """Filtering by category_slug returns only products in that category."""
    cat, p1, p2 = await _seed()

    resp = await async_client.get("/api/v1/products", params={"category_slug": "pizzas"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["pagination"]["total"] == 2
    assert len(body["data"]) == 2


async def test_list_products_by_nonexistent_category(async_client):
    """Filtering by a non-existent category slug returns empty results."""
    await _seed()

    resp = await async_client.get(
        "/api/v1/products", params={"category_slug": "no-such-cat"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] == []
    assert body["pagination"]["total"] == 0


async def test_search_products(async_client):
    """The 'search' query param filters products by name (case-insensitive ILIKE)."""
    await _seed()

    resp = await async_client.get("/api/v1/products", params={"search": "muzz"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["pagination"]["total"] == 1
    assert body["data"][0]["name"] == "Muzzarella"


async def test_search_products_no_match(async_client):
    """Search with a term that matches nothing returns empty."""
    await _seed()

    resp = await async_client.get("/api/v1/products", params={"search": "xyz123"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] == []
    assert body["pagination"]["total"] == 0


async def test_list_products_is_featured(async_client):
    """Filtering by is_featured=true returns only featured products."""
    await _seed()

    resp = await async_client.get("/api/v1/products", params={"is_featured": "true"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["pagination"]["total"] == 1
    assert body["data"][0]["name"] == "Muzzarella"


async def test_list_products_pagination(async_client):
    """Pagination returns the correct page and respects limit."""
    cat, p1, p2 = await _seed()

    resp = await async_client.get("/api/v1/products", params={"limit": "1", "page": "1"})
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["data"]) == 1
    assert body["pagination"]["page"] == 1
    assert body["pagination"]["limit"] == 1
    assert body["pagination"]["total"] == 2
    assert body["pagination"]["pages"] == 2

    # Page 2
    resp2 = await async_client.get("/api/v1/products", params={"limit": "1", "page": "2"})
    assert resp2.status_code == 200
    body2 = resp2.json()
    assert len(body2["data"]) == 1
    # The second page should return a different product
    assert body2["data"][0]["id"] != body["data"][0]["id"]


async def test_list_products_limit_max_100(async_client):
    """The limit query param is capped at 100 by the schema."""
    await _seed()
    # limit=200 should be rejected (422) because of Query(le=100)
    resp = await async_client.get("/api/v1/products", params={"limit": "200"})
    # FastAPI query validation – le=100 means > 100 returns 422
    assert resp.status_code == 422


# ===================================================================
# FEATURED PRODUCTS
# ===================================================================
async def test_get_featured_products(async_client):
    """The /featured endpoint returns only products with is_featured=True and is_available=True."""
    await _seed()

    resp = await async_client.get("/api/v1/products/featured")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert len(body["data"]) == 1
    assert body["data"][0]["name"] == "Muzzarella"
    assert body["data"][0]["is_featured"] is True


async def test_get_featured_products_empty(async_client):
    """When no featured products exist, returns an empty list."""
    resp = await async_client.get("/api/v1/products/featured")
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] == []


async def test_get_featured_products_unavailable_excluded(async_client):
    """Featured but unavailable products are NOT returned by /featured."""
    from app.models.category import Category
    from app.models.product import Product

    factory = get_test_session_factory()
    async with factory() as session:
        cat = Category(name="Test", slug="test")
        session.add(cat)
        await session.flush()

        prod = Product(
            name="Unavailable Featured",
            slug="unavail-feat",
            price=Decimal("100.00"),
            category_id=cat.id,
            is_featured=True,
            is_available=False,   # ← unavailable
        )
        session.add(prod)
        await session.commit()

    resp = await async_client.get("/api/v1/products/featured")
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] == []   # unavailable product excluded


# ===================================================================
# SINGLE PRODUCT BY SLUG
# ===================================================================
async def test_get_product_by_slug(async_client):
    """GET /products/{slug} returns a single product (no wrapper envelope)."""
    await _seed()

    resp = await async_client.get("/api/v1/products/muzzarella")
    assert resp.status_code == 200
    # This endpoint uses response_model=ProductResponse – NO {"success":...} wrapper!
    data = resp.json()
    assert data["name"] == "Muzzarella"
    assert data["slug"] == "muzzarella"
    assert Decimal(data["price"]) == Decimal("380.00")
    assert data["is_featured"] is True


async def test_get_product_not_found(async_client):
    """GET /products/{nonexistent} returns 404."""
    resp = await async_client.get("/api/v1/products/nonexistent-product")
    assert resp.status_code == 404
