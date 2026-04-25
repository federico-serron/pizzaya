"""
Shared fixtures and helpers for PizzaYA backend tests.

Provides:
- async_client: httpx.AsyncClient pointing at the FastAPI app with a test database.
- clear_cart: autouse fixture to reset the in-memory cart store between tests.
- Helper functions: create_admin_user, seed_categories_and_products, login_as.
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.database import get_db, Base
from app.routers.cart import cart_store
from app.config import settings

TEST_DB_URL = "sqlite+aiosqlite:///./test_pizzaya.db"

# ---------------------------------------------------------------------------
# Module-level reference to the current test session factory so that helper
# functions can access the test DB directly (e.g. for seeding).
# ---------------------------------------------------------------------------
_test_session_factory: async_sessionmaker | None = None


def get_test_session_factory() -> async_sessionmaker:
    """Return the current test session factory.

    Only valid while a test is executing (i.e. inside a function that depends
    on the ``async_client`` fixture).
    """
    if _test_session_factory is None:
        raise RuntimeError(
            "Test session factory not initialised – make sure your test "
            "depends on the ``async_client`` fixture."
        )
    return _test_session_factory


# ---------------------------------------------------------------------------
# Autouse fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(autouse=True)
def clear_cart():
    """Clear the in-memory cart store before and after every test."""
    cart_store.clear()
    yield
    cart_store.clear()


# ---------------------------------------------------------------------------
# Core test fixture
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture(scope="function")
async def async_client() -> AsyncClient:
    """Return an ``httpx.AsyncClient`` connected to the FastAPI app.

    The client uses a clean, file-based SQLite test database that is created
    fresh at the start of every test and destroyed afterwards.  The production
    ``get_db`` dependency is overridden so all endpoint code uses the test DB.
    """
    global _test_session_factory

    # 1. Create test engine & clean slate
    test_engine = create_async_engine(TEST_DB_URL, echo=False)
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # 2. Session factory for the test DB
    _test_session_factory = async_sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )

    # 3. Override FastAPI's ``get_db`` dependency
    async def override_get_db():
        async with _test_session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[get_db] = override_get_db

    # 4. Create the ASGI test client
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    # 5. Teardown
    app.dependency_overrides.pop(get_db, None)
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()
    _test_session_factory = None


# ===================================================================
# Helper functions (NOT fixtures – call them inside test functions)
# ===================================================================

async def create_admin_user(
    email: str = "admin@test.com",
    password: str = "Admin123!",
) -> str:
    """Create an admin user directly in the test DB and return the user ID."""
    from app.models.user import User
    from app.services.auth_service import hash_password

    factory = get_test_session_factory()
    async with factory() as session:
        user = User(
            email=email,
            password_hash=hash_password(password),
            full_name="Test Admin",
            role="admin",
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user.id


async def create_customer_user(
    email: str = "customer@test.com",
    password: str = "Customer123!",
) -> str:
    """Create a regular customer user directly in the test DB and return the ID."""
    from app.models.user import User
    from app.services.auth_service import hash_password

    factory = get_test_session_factory()
    async with factory() as session:
        user = User(
            email=email,
            password_hash=hash_password(password),
            full_name="Test Customer",
            role="customer",
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user.id


async def seed_categories_and_products():
    """Insert a category and product directly into the test DB.

    Returns
    -------
    tuple[Category, Product]
        The newly created category and product ORM instances (expired).
    """
    from app.models.category import Category
    from app.models.product import Product
    from decimal import Decimal

    factory = get_test_session_factory()
    async with factory() as session:
        cat = Category(name="Pizzas", slug="pizzas", display_order=1)
        session.add(cat)
        await session.flush()

        prod = Product(
            name="Muzzarella",
            slug="muzzarella",
            description="Queso muzzarella, salsa de tomate",
            price=Decimal("380.00"),
            category_id=cat.id,
            is_available=True,
            is_featured=True,
        )
        session.add(prod)
        await session.commit()

        # Refresh to get auto-generated fields
        await session.refresh(cat)
        await session.refresh(prod)
        return cat, prod


async def login_as(client: AsyncClient, email: str, password: str):
    """Log in with the given credentials and return the response.

    The client will store cookies automatically so subsequent requests
    from the same client will be authenticated.
    """
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    return resp


async def register_and_login(
    client: AsyncClient,
    email: str = "testuser@test.com",
    password: str = "Test123!",
    full_name: str = "Test User",
):
    """Register a new user and log them in. Returns both responses."""
    reg_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": full_name,
        },
    )
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    return reg_resp, login_resp
