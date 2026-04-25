"""
Tests for the orders endpoints (authentication required).

Endpoints covered
-----------------
POST  /api/v1/orders                – create order from cart
GET   /api/v1/orders                – list user's orders (paginated)
GET   /api/v1/orders/{order_id}     – get single order
"""

import pytest

from tests.conftest import get_test_session_factory, seed_categories_and_products


# ===================================================================
# Helpers
# ===================================================================
async def _register_login_and_seed(async_client):
    """Register a user, log them in, and seed a product in the test DB.
    Returns (reg_resp, login_resp, product_id, product_name, product_price).
    """
    # Register + login
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "orderuser@test.com",
            "password": "Test123!",
            "full_name": "Order User",
        },
    )
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "orderuser@test.com", "password": "Test123!"},
    )
    assert login_resp.status_code == 200

    # Seed a product
    cat, prod = await seed_categories_and_products()
    return login_resp, prod.id, prod.name, float(prod.price)


async def _add_to_cart(client, product_id: str, name: str, price: float, quantity: int = 1):
    """Add an item to the cart via the POST /items endpoint (query params)."""
    return await client.post(
        "/api/v1/cart/items",
        params={
            "product_id": product_id,
            "name": name,
            "price": str(price),
            "quantity": str(quantity),
        },
    )


# ===================================================================
# CREATE ORDER
# ===================================================================
async def test_create_order_authenticated(async_client):
    """An authenticated user with items in their cart can create an order."""
    login_resp, prod_id, prod_name, prod_price = await _register_login_and_seed(async_client)

    # Add to cart
    cart_resp = await _add_to_cart(async_client, prod_id, prod_name, prod_price, 2)
    assert cart_resp.status_code == 200

    # Create order
    resp = await async_client.post(
        "/api/v1/orders",
        json={"notes": "Sin cebolla por favor"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["success"] is True
    data = body["data"]
    assert data["status"] == "pending"
    assert data["payment_status"] == "pending"
    assert data["notes"] == "Sin cebolla por favor"
    assert len(data["items"]) == 1
    assert data["items"][0]["product_name"] == prod_name
    assert data["items"][0]["quantity"] == 2
    # Total should be price * 2
    assert float(data["total"]) == prod_price * 2

    # Cart should be emptied after order creation
    cart_after = await async_client.get("/api/v1/cart")
    assert cart_after.json()["data"]["items"] == []


async def test_create_order_empty_cart(async_client):
    """Creating an order with an empty cart returns 400."""
    # Register + login
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "emptycart@test.com",
            "password": "Test123!",
            "full_name": "Empty Cart",
        },
    )
    await async_client.post(
        "/api/v1/auth/login",
        json={"email": "emptycart@test.com", "password": "Test123!"},
    )

    resp = await async_client.post("/api/v1/orders", json={})
    assert resp.status_code == 400
    assert "Cart is empty" in resp.json()["detail"]


async def test_create_order_unauthenticated(async_client):
    """POST /orders without authentication returns 401."""
    resp = await async_client.post("/api/v1/orders", json={})
    assert resp.status_code == 401


async def test_create_order_with_pickup_time(async_client):
    """Order creation accepts an optional pickup_time."""
    login_resp, prod_id, prod_name, prod_price = await _register_login_and_seed(async_client)
    await _add_to_cart(async_client, prod_id, prod_name, prod_price, 1)

    resp = await async_client.post(
        "/api/v1/orders",
        json={
            "pickup_time": "2026-04-26T12:00:00Z",
            "notes": "Pedido anticipado",
        },
    )
    assert resp.status_code == 201
    data = resp.json()["data"]
    assert data["pickup_time"] is not None
    assert "2026-04-26" in data["pickup_time"]


async def test_create_order_product_unavailable(async_client):
    """If a product in the cart is unavailable, order creation fails with 400."""
    from app.models.category import Category
    from app.models.product import Product
    from decimal import Decimal

    # Create an UNAVAILABLE product directly in DB
    factory = get_test_session_factory()
    async with factory() as session:
        cat = Category(name="Test", slug="test")
        session.add(cat)
        await session.flush()

        prod = Product(
            name="Unavailable Pizza",
            slug="unavail-pizza",
            price=Decimal("500.00"),
            category_id=cat.id,
            is_available=False,
        )
        session.add(prod)
        await session.commit()
        await session.refresh(prod)

    # Register + login
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "unavail@test.com",
            "password": "Test123!",
            "full_name": "Unavail User",
        },
    )
    await async_client.post(
        "/api/v1/auth/login",
        json={"email": "unavail@test.com", "password": "Test123!"},
    )

    # Add unavailable product to cart
    await _add_to_cart(async_client, prod.id, prod.name, float(prod.price), 1)

    # Try to create order
    resp = await async_client.post("/api/v1/orders", json={})
    assert resp.status_code == 400
    assert "not available" in resp.json()["detail"]


# ===================================================================
# LIST USER ORDERS
# ===================================================================
async def test_get_my_orders(async_client):
    """GET /orders returns the authenticated user's orders with pagination."""
    login_resp, prod_id, prod_name, prod_price = await _register_login_and_seed(async_client)

    # Create two orders
    await _add_to_cart(async_client, prod_id, prod_name, prod_price, 1)
    await async_client.post("/api/v1/orders", json={"notes": "Order 1"})

    await _add_to_cart(async_client, prod_id, prod_name, prod_price, 1)
    await async_client.post("/api/v1/orders", json={"notes": "Order 2"})

    resp = await async_client.get("/api/v1/orders")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert len(body["data"]) == 2
    assert body["pagination"]["total"] == 2
    assert body["data"][0]["notes"] == "Order 2"  # newest first (desc)
    assert body["data"][1]["notes"] == "Order 1"


async def test_get_my_orders_unauthenticated(async_client):
    """GET /orders without authentication returns 401."""
    resp = await async_client.get("/api/v1/orders")
    assert resp.status_code == 401


async def test_get_my_orders_empty(async_client):
    """A user with no orders gets an empty list."""
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "noorders@test.com",
            "password": "Test123!",
            "full_name": "No Orders",
        },
    )
    await async_client.post(
        "/api/v1/auth/login",
        json={"email": "noorders@test.com", "password": "Test123!"},
    )

    resp = await async_client.get("/api/v1/orders")
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] == []
    assert body["pagination"]["total"] == 0


# ===================================================================
# GET SINGLE ORDER
# ===================================================================
async def test_get_order_by_id(async_client):
    """GET /orders/{id} returns the order if it belongs to the current user."""
    login_resp, prod_id, prod_name, prod_price = await _register_login_and_seed(async_client)

    await _add_to_cart(async_client, prod_id, prod_name, prod_price, 1)
    create_resp = await async_client.post("/api/v1/orders", json={})
    order_id = create_resp.json()["data"]["id"]

    resp = await async_client.get(f"/api/v1/orders/{order_id}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["id"] == order_id
    assert len(body["data"]["items"]) == 1


async def test_get_order_not_found(async_client):
    """GET /orders/{nonexistent} returns 404."""
    # Register + login
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "nforder@test.com",
            "password": "Test123!",
            "full_name": "NF Order",
        },
    )
    await async_client.post(
        "/api/v1/auth/login",
        json={"email": "nforder@test.com", "password": "Test123!"},
    )

    resp = await async_client.get("/api/v1/orders/nonexistent-order-id")
    assert resp.status_code == 404


async def test_get_order_not_mine(async_client):
    """GET /orders/{id} returns 403 when the order belongs to another user."""
    # User A: register, login, create an order
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "usera@test.com",
            "password": "Test123!",
            "full_name": "User A",
        },
    )
    await async_client.post(
        "/api/v1/auth/login",
        json={"email": "usera@test.com", "password": "Test123!"},
    )

    cat, prod = await seed_categories_and_products()
    await _add_to_cart(async_client, prod.id, prod.name, float(prod.price), 1)
    create_resp = await async_client.post("/api/v1/orders", json={})
    order_id = create_resp.json()["data"]["id"]

    # User B: register, login (no orders)
    # We need a second client because the first client's cookies are for User A.
    from httpx import AsyncClient, ASGITransport
    from app.main import app

    # Actually, we can use the same async_client but with different cookies.
    # Let's create a second client.
    from app.database import get_db
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

    # For simplicity, log out user A and register/login user B in the same client.
    await async_client.post("/api/v1/auth/logout")

    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "userb@test.com",
            "password": "Test123!",
            "full_name": "User B",
        },
    )
    await async_client.post(
        "/api/v1/auth/login",
        json={"email": "userb@test.com", "password": "Test123!"},
    )

    # User B tries to access User A's order
    resp = await async_client.get(f"/api/v1/orders/{order_id}")
    assert resp.status_code == 403
    assert "Not your order" in resp.json()["detail"]
