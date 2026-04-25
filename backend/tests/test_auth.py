"""
Tests for the auth endpoints: register, login, logout, /me, refresh.

Endpoints covered
-----------------
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me
"""

import pytest


# ===================================================================
# REGISTER
# ===================================================================
async def test_register_user_success(async_client):
    """Registering a new user returns 201 and the user object (no token)."""
    resp = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@test.com",
            "password": "Test123!",
            "full_name": "New User",
            "phone": "099123456",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["success"] is True
    data = body["data"]
    assert data["email"] == "newuser@test.com"
    assert data["full_name"] == "New User"
    assert data["role"] == "customer"
    assert data["is_active"] is True
    assert "id" in data
    # The register response does NOT contain an access_token at top level
    assert "access_token" not in data


async def test_register_duplicate_email(async_client):
    """Registering the same email twice returns 400."""
    payload = {
        "email": "dup@test.com",
        "password": "Test123!",
        "full_name": "First User",
    }
    # First registration – should succeed
    r1 = await async_client.post("/api/v1/auth/register", json=payload)
    assert r1.status_code == 201

    # Second registration with same email – should fail
    r2 = await async_client.post("/api/v1/auth/register", json=payload)
    assert r2.status_code == 400
    body = r2.json()
    assert "Email already registered" in body["detail"]


async def test_register_missing_fields(async_client):
    """Missing required fields returns 422."""
    resp = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "bad@test.com"},
    )
    assert resp.status_code == 422


async def test_register_invalid_email(async_client):
    """An invalid email format returns 422."""
    resp = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "not-an-email",
            "password": "Test123!",
            "full_name": "Bad Email",
        },
    )
    assert resp.status_code == 422


# ===================================================================
# LOGIN
# ===================================================================
async def test_login_success(async_client):
    """Login with valid credentials returns 200, sets cookies, and returns user + token."""
    # Register first
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "loginuser@test.com",
            "password": "Test123!",
            "full_name": "Login User",
        },
    )

    # Login
    resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "loginuser@test.com", "password": "Test123!"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True

    data = body["data"]
    assert "user" in data
    assert data["user"]["email"] == "loginuser@test.com"
    assert "access_token" in data

    # Cookies should be set by the response
    assert "access_token" in resp.cookies
    assert "refresh_token" in resp.cookies
    # access_token cookie should be httponly (we can't check via httpx but it's set)


async def test_login_invalid_password(async_client):
    """Login with wrong password returns 401."""
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrongpass@test.com",
            "password": "Test123!",
            "full_name": "Wrong Pass User",
        },
    )

    resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "wrongpass@test.com", "password": "WrongPassword!"},
    )
    assert resp.status_code == 401
    assert "Invalid email or password" in resp.json()["detail"]


async def test_login_nonexistent_user(async_client):
    """Login with an email that does not exist returns 401."""
    resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "noone@test.com", "password": "Password123!"},
    )
    assert resp.status_code == 401
    assert "Invalid email or password" in resp.json()["detail"]


async def test_login_inactive_user(async_client):
    """Login as an inactive user returns 401."""
    # Create user directly in DB and set inactive
    from app.models.user import User
    from app.services.auth_service import hash_password
    from tests.conftest import get_test_session_factory

    factory = get_test_session_factory()
    async with factory() as session:
        user = User(
            email="inactive@test.com",
            password_hash=hash_password("Test123!"),
            full_name="Inactive User",
            is_active=False,
        )
        session.add(user)
        await session.commit()

    resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "inactive@test.com", "password": "Test123!"},
    )
    assert resp.status_code == 401


# ===================================================================
# GET /me
# ===================================================================
async def test_get_me_authenticated(async_client):
    """GET /me with valid cookies returns the current user."""
    # Register + login
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "meuser@test.com",
            "password": "Test123!",
            "full_name": "Me User",
        },
    )
    await async_client.post(
        "/api/v1/auth/login",
        json={"email": "meuser@test.com", "password": "Test123!"},
    )

    # The client now has cookies set – /me should succeed
    resp = await async_client.get("/api/v1/auth/me")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["email"] == "meuser@test.com"
    assert body["data"]["role"] == "customer"


async def test_get_me_unauthenticated(async_client):
    """GET /me without cookies returns 401."""
    resp = await async_client.get("/api/v1/auth/me")
    assert resp.status_code == 401


async def test_get_me_invalid_token(async_client):
    """GET /me with an invalid/expired token in cookies returns 401."""
    # Set a garbage access_token cookie manually
    async_client.cookies.set("access_token", "garbage_token", domain="test")
    resp = await async_client.get("/api/v1/auth/me")
    assert resp.status_code == 401


# ===================================================================
# LOGOUT
# ===================================================================
async def test_logout(async_client):
    """POST /logout clears cookies and returns success."""
    # Register + login
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "logoutuser@test.com",
            "password": "Test123!",
            "full_name": "Logout User",
        },
    )
    await async_client.post(
        "/api/v1/auth/login",
        json={"email": "logoutuser@test.com", "password": "Test123!"},
    )

    # Logout
    resp = await async_client.post("/api/v1/auth/logout")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True

    # After logout, /me should return 401
    resp2 = await async_client.get("/api/v1/auth/me")
    assert resp2.status_code == 401


# ===================================================================
# REFRESH TOKEN
# ===================================================================
async def test_refresh_token_success(async_client):
    """POST /refresh with a valid refresh_token cookie returns a new access token."""
    # Register + login (this sets both cookies in the client)
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "refreshuser@test.com",
            "password": "Test123!",
            "full_name": "Refresh User",
        },
    )
    await async_client.post(
        "/api/v1/auth/login",
        json={"email": "refreshuser@test.com", "password": "Test123!"},
    )

    # Refresh
    resp = await async_client.post("/api/v1/auth/refresh")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert "access_token" in body["data"]


async def test_refresh_token_unauthenticated(async_client):
    """POST /refresh without a refresh_token cookie returns 401."""
    resp = await async_client.post("/api/v1/auth/refresh")
    assert resp.status_code == 401
