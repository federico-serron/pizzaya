"""
Tests for the category endpoints (public, no auth required).

Endpoints covered
-----------------
GET  /api/v1/categories             – list active categories
GET  /api/v1/categories/{slug}      – single category by slug
"""

import pytest

from tests.conftest import get_test_session_factory


# ===================================================================
# Helpers
# ===================================================================
async def _seed_two_categories():
    """Insert two categories: one active, one inactive."""
    from app.models.category import Category

    factory = get_test_session_factory()
    async with factory() as session:
        cat1 = Category(name="Pizzas", slug="pizzas", display_order=1, is_active=True)
        cat2 = Category(name="Empanadas", slug="empanadas", display_order=2, is_active=False)
        session.add_all([cat1, cat2])
        await session.commit()
        await session.refresh(cat1)
        await session.refresh(cat2)
        return cat1, cat2


# ===================================================================
# LIST CATEGORIES
# ===================================================================
async def test_list_categories(async_client):
    """Listing categories returns all active categories, ordered by display_order."""
    cat1, cat2 = await _seed_two_categories()

    resp = await async_client.get("/api/v1/categories")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert len(body["data"]) == 1   # only active categories
    assert body["data"][0]["name"] == "Pizzas"
    assert body["data"][0]["slug"] == "pizzas"
    assert body["data"][0]["is_active"] is True


async def test_list_categories_empty(async_client):
    """When no categories exist, returns an empty list."""
    resp = await async_client.get("/api/v1/categories")
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] == []


async def test_list_categories_inactive_excluded(async_client):
    """Inactive categories are not included in the list."""
    await _seed_two_categories()

    resp = await async_client.get("/api/v1/categories")
    data = resp.json()["data"]
    slugs = [c["slug"] for c in data]
    assert "empanadas" not in slugs    # inactive
    assert "pizzas" in slugs           # active


async def test_list_categories_order(async_client):
    """Categories are returned ordered by display_order ascending."""
    from app.models.category import Category

    factory = get_test_session_factory()
    async with factory() as session:
        c3 = Category(name="Third", slug="third", display_order=3, is_active=True)
        c1 = Category(name="First", slug="first", display_order=1, is_active=True)
        c2 = Category(name="Second", slug="second", display_order=2, is_active=True)
        session.add_all([c3, c1, c2])
        await session.commit()

    resp = await async_client.get("/api/v1/categories")
    data = resp.json()["data"]
    assert len(data) == 3
    assert data[0]["display_order"] == 1
    assert data[1]["display_order"] == 2
    assert data[2]["display_order"] == 3


# ===================================================================
# SINGLE CATEGORY BY SLUG
# ===================================================================
async def test_get_category_by_slug(async_client):
    """GET /categories/{slug} returns a single category with its products."""
    cat1, cat2 = await _seed_two_categories()

    resp = await async_client.get("/api/v1/categories/pizzas")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    data = body["data"]
    assert data["name"] == "Pizzas"
    assert data["slug"] == "pizzas"
    assert "products" in data
    assert data["products"] == []   # no products seeded here


async def test_get_category_not_found(async_client):
    """GET /categories/{nonexistent} returns 404."""
    resp = await async_client.get("/api/v1/categories/nonexistent-cat")
    assert resp.status_code == 404
