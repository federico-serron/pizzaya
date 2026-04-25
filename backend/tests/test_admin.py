"""
Tests for the admin endpoints (admin role required).

Endpoints covered
-----------------
GET    /api/v1/admin/dashboard                          – dashboard stats
POST   /api/v1/admin/products                           – create product
PUT    /api/v1/admin/products/{id}                      – update product
DELETE /api/v1/admin/products/{id}                      – delete product
PATCH  /api/v1/admin/products/{id}/availability          – toggle availability
POST   /api/v1/admin/categories                         – create category
PUT    /api/v1/admin/categories/{id}                    – update category
DELETE /api/v1/admin/categories/{id}                    – delete category
GET    /api/v1/admin/orders                             – list all orders
GET    /api/v1/admin/orders/{id}                        – get any order
PATCH  /api/v1/admin/orders/{id}/status                 – update order status

Also tests that CUSTOMERS get 403 on admin routes.
"""

import pytest

from tests.conftest import (
    create_admin_user,
    create_customer_user,
    get_test_session_factory,
    seed_categories_and_products,
    login_as,
)


# ===================================================================
# Helpers – admin login
# ===================================================================
async def _login_as_admin(client) -> dict:
    """Create admin user in DB, log in, return user ID."""
    user_id = await create_admin_user()
    resp = await login_as(client, "admin@test.com", "Admin123!")
    assert resp.status_code == 200
    return user_id


async def _login_as_customer(client) -> dict:
    """Create customer user in DB, log in."""
    await create_customer_user()
    resp = await login_as(client, "customer@test.com", "Customer123!")
    assert resp.status_code == 200


# ===================================================================
# Dashboard
# ===================================================================
async def test_admin_dashboard(async_client):
    """An admin can access the dashboard and see stats."""
    await _login_as_admin(async_client)

    resp = await async_client.get("/api/v1/admin/dashboard")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    data = body["data"]
    assert "orders_today" in data
    assert "revenue_today" in data
    assert "pending_orders" in data


async def test_admin_dashboard_as_customer(async_client):
    """A customer cannot access the admin dashboard (403)."""
    await _login_as_customer(async_client)

    resp = await async_client.get("/api/v1/admin/dashboard")
    assert resp.status_code == 403


async def test_admin_dashboard_unauthenticated(async_client):
    """Unauthenticated access to admin dashboard returns 401."""
    resp = await async_client.get("/api/v1/admin/dashboard")
    assert resp.status_code == 401


# ===================================================================
# Products CRUD
# ===================================================================
async def test_create_product_as_admin(async_client):
    """Admin can create a product."""
    await _login_as_admin(async_client)

    # First create a category to assign
    cat_resp = await async_client.post(
        "/api/v1/admin/categories",
        json={"name": "Pizzas", "slug": "pizzas"},
    )
    cat_id = cat_resp.json()["data"]["id"]

    resp = await async_client.post(
        "/api/v1/admin/products",
        json={
            "name": "Muzzarella",
            "slug": "muzzarella",
            "description": "Queso muzzarella",
            "price": "380.00",
            "category_id": cat_id,
            "is_featured": True,
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["success"] is True
    data = body["data"]
    assert data["name"] == "Muzzarella"
    assert data["slug"] == "muzzarella"
    assert float(data["price"]) == 380.0
    assert data["is_featured"] is True
    assert data["is_available"] is True
    assert "id" in data
    assert "created_at" in data


async def test_create_product_as_customer(async_client):
    """A customer cannot create a product (403)."""
    await _login_as_customer(async_client)

    resp = await async_client.post(
        "/api/v1/admin/products",
        json={
            "name": "Hack Pizza",
            "slug": "hack-pizza",
            "price": "1.00",
            "category_id": "some-cat-id",
        },
    )
    assert resp.status_code == 403


async def test_update_product(async_client):
    """Admin can update a product."""
    await _login_as_admin(async_client)

    # Create a category + product
    cat_resp = await async_client.post(
        "/api/v1/admin/categories",
        json={"name": "Empanadas", "slug": "empanadas"},
    )
    cat_id = cat_resp.json()["data"]["id"]

    prod_resp = await async_client.post(
        "/api/v1/admin/products",
        json={
            "name": "Carne",
            "slug": "carne",
            "price": "90.00",
            "category_id": cat_id,
        },
    )
    prod_id = prod_resp.json()["data"]["id"]

    # Update
    resp = await async_client.put(
        f"/api/v1/admin/products/{prod_id}",
        json={"name": "Empanada de Carne", "price": "95.00", "is_featured": True},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["name"] == "Empanada de Carne"
    assert float(data["price"]) == 95.0
    assert data["is_featured"] is True
    assert data["slug"] == "carne"   # unchanged


async def test_update_product_not_found(async_client):
    """Updating a non-existent product returns 404."""
    await _login_as_admin(async_client)

    resp = await async_client.put(
        "/api/v1/admin/products/nonexistent-id",
        json={"name": "Ghost"},
    )
    assert resp.status_code == 404


async def test_delete_product(async_client):
    """Admin can delete a product."""
    await _login_as_admin(async_client)

    cat_resp = await async_client.post(
        "/api/v1/admin/categories",
        json={"name": "Bebidas", "slug": "bebidas"},
    )
    cat_id = cat_resp.json()["data"]["id"]

    prod_resp = await async_client.post(
        "/api/v1/admin/products",
        json={
            "name": "Coca-Cola",
            "slug": "coca-cola",
            "price": "80.00",
            "category_id": cat_id,
        },
    )
    prod_id = prod_resp.json()["data"]["id"]

    resp = await async_client.delete(f"/api/v1/admin/products/{prod_id}")
    assert resp.status_code == 200
    assert "Product deleted" in resp.json()["data"]["message"]

    # Verify product is gone from public endpoint
    get_resp = await async_client.get("/api/v1/products/coca-cola")
    assert get_resp.status_code == 404


async def test_delete_product_not_found(async_client):
    """Deleting a non-existent product returns 404."""
    await _login_as_admin(async_client)

    resp = await async_client.delete("/api/v1/admin/products/nonexistent-id")
    assert resp.status_code == 404


async def test_toggle_product_availability(async_client):
    """Admin can toggle a product's availability."""
    await _login_as_admin(async_client)

    cat_resp = await async_client.post(
        "/api/v1/admin/categories",
        json={"name": "Postres", "slug": "postres"},
    )
    cat_id = cat_resp.json()["data"]["id"]

    prod_resp = await async_client.post(
        "/api/v1/admin/products",
        json={
            "name": "Flan",
            "slug": "flan",
            "price": "180.00",
            "category_id": cat_id,
        },
    )
    prod_id = prod_resp.json()["data"]["id"]
    assert prod_resp.json()["data"]["is_available"] is True

    # Toggle to unavailable
    resp = await async_client.patch(f"/api/v1/admin/products/{prod_id}/availability")
    assert resp.status_code == 200
    assert resp.json()["data"]["is_available"] is False

    # Toggle back to available
    resp2 = await async_client.patch(f"/api/v1/admin/products/{prod_id}/availability")
    assert resp2.status_code == 200
    assert resp2.json()["data"]["is_available"] is True


# ===================================================================
# Categories CRUD
# ===================================================================
async def test_create_category_as_admin(async_client):
    """Admin can create a category."""
    await _login_as_admin(async_client)

    resp = await async_client.post(
        "/api/v1/admin/categories",
        json={
            "name": "Pizzas",
            "slug": "pizzas",
            "description": "Las mejores pizzas",
            "display_order": 1,
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["success"] is True
    data = body["data"]
    assert data["name"] == "Pizzas"
    assert data["slug"] == "pizzas"
    assert data["description"] == "Las mejores pizzas"
    assert data["display_order"] == 1
    assert data["is_active"] is True


async def test_update_category(async_client):
    """Admin can update a category."""
    await _login_as_admin(async_client)

    cat_resp = await async_client.post(
        "/api/v1/admin/categories",
        json={"name": "Bebidas", "slug": "bebidas"},
    )
    cat_id = cat_resp.json()["data"]["id"]

    resp = await async_client.put(
        f"/api/v1/admin/categories/{cat_id}",
        json={"name": "Bebidas y Jugos", "display_order": 5},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["name"] == "Bebidas y Jugos"
    assert data["display_order"] == 5
    assert data["slug"] == "bebidas"   # unchanged


async def test_delete_category(async_client):
    """Admin can delete a category that has no products."""
    await _login_as_admin(async_client)

    cat_resp = await async_client.post(
        "/api/v1/admin/categories",
        json={"name": "EmptyCat", "slug": "empty-cat"},
    )
    cat_id = cat_resp.json()["data"]["id"]

    resp = await async_client.delete(f"/api/v1/admin/categories/{cat_id}")
    assert resp.status_code == 200
    assert "Category deleted" in resp.json()["data"]["message"]


async def test_delete_category_with_products(async_client):
    """Admin cannot delete a category that still has products (400)."""
    await _login_as_admin(async_client)

    cat_resp = await async_client.post(
        "/api/v1/admin/categories",
        json={"name": "ConProductos", "slug": "con-productos"},
    )
    cat_id = cat_resp.json()["data"]["id"]

    # Add a product to this category
    await async_client.post(
        "/api/v1/admin/products",
        json={
            "name": "Test Product",
            "slug": "test-product",
            "price": "100.00",
            "category_id": cat_id,
        },
    )

    resp = await async_client.delete(f"/api/v1/admin/categories/{cat_id}")
    assert resp.status_code == 400
    assert "Cannot delete category with products" in resp.json()["detail"]


async def test_delete_category_not_found(async_client):
    """Deleting a non-existent category returns 404."""
    await _login_as_admin(async_client)

    resp = await async_client.delete("/api/v1/admin/categories/nonexistent-id")
    assert resp.status_code == 404


async def test_update_category_not_found(async_client):
    """Updating a non-existent category returns 404."""
    await _login_as_admin(async_client)

    resp = await async_client.put(
        "/api/v1/admin/categories/nonexistent-id",
        json={"name": "Ghost"},
    )
    assert resp.status_code == 404


# ===================================================================
# Orders Management
# ===================================================================
async def test_list_orders_as_admin(async_client):
    """Admin can list all orders (not just their own)."""
    await _login_as_admin(async_client)

    resp = await async_client.get("/api/v1/admin/orders")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert "data" in body
    assert "pagination" in body


async def test_list_orders_filter_by_status(async_client):
    """Admin can filter orders by status."""
    await _login_as_admin(async_client)

    resp = await async_client.get("/api/v1/admin/orders", params={"status": "pending"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True


async def test_get_order_as_admin(async_client):
    """Admin can view any order by ID, even if it doesn't belong to them."""
    # Create a customer order first
    await _login_as_customer(async_client)
    cat, prod = await seed_categories_and_products()

    # Add to cart and create order as customer
    await async_client.post(
        "/api/v1/cart/items",
        params={
            "product_id": prod.id,
            "name": prod.name,
            "price": str(float(prod.price)),
            "quantity": "1",
        },
    )
    order_resp = await async_client.post("/api/v1/orders", json={})
    order_id = order_resp.json()["data"]["id"]

    # Logout customer, login as admin
    await async_client.post("/api/v1/auth/logout")
    await _login_as_admin(async_client)

    # Admin can see the customer's order
    resp = await async_client.get(f"/api/v1/admin/orders/{order_id}")
    assert resp.status_code == 200
    assert resp.json()["data"]["id"] == order_id


async def test_update_order_status(async_client):
    """Admin can update an order's status with a valid transition."""
    # Create a customer order
    await _login_as_customer(async_client)
    cat, prod = await seed_categories_and_products()

    await async_client.post(
        "/api/v1/cart/items",
        params={
            "product_id": prod.id,
            "name": prod.name,
            "price": str(float(prod.price)),
            "quantity": "1",
        },
    )
    order_resp = await async_client.post("/api/v1/orders", json={})
    order_id = order_resp.json()["data"]["id"]

    # Logout, login as admin
    await async_client.post("/api/v1/auth/logout")
    await _login_as_admin(async_client)

    # Transition: pending -> confirmed
    resp = await async_client.patch(
        f"/api/v1/admin/orders/{order_id}/status",
        params={"new_status": "confirmed"},
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["status"] == "confirmed"

    # Transition: confirmed -> preparing
    resp2 = await async_client.patch(
        f"/api/v1/admin/orders/{order_id}/status",
        params={"new_status": "preparing"},
    )
    assert resp2.status_code == 200
    assert resp2.json()["data"]["status"] == "preparing"


async def test_update_order_status_invalid_transition(async_client):
    """Invalid status transitions return 400."""
    await _login_as_customer(async_client)
    cat, prod = await seed_categories_and_products()

    await async_client.post(
        "/api/v1/cart/items",
        params={
            "product_id": prod.id,
            "name": prod.name,
            "price": str(float(prod.price)),
            "quantity": "1",
        },
    )
    order_resp = await async_client.post("/api/v1/orders", json={})
    order_id = order_resp.json()["data"]["id"]

    await async_client.post("/api/v1/auth/logout")
    await _login_as_admin(async_client)

    # pending -> completed is NOT a valid transition (should go through confirmed, preparing, ready)
    resp = await async_client.patch(
        f"/api/v1/admin/orders/{order_id}/status",
        params={"new_status": "completed"},
    )
    assert resp.status_code == 400
    assert "Cannot transition" in resp.json()["detail"]


async def test_admin_orders_as_customer(async_client):
    """A customer cannot access admin order endpoints (403)."""
    await _login_as_customer(async_client)

    resp = await async_client.get("/api/v1/admin/orders")
    assert resp.status_code == 403
