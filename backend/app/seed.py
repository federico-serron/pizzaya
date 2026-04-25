import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import async_session, init_db
from app.models.category import Category
from app.models.product import Product
from app.models.user import User
from app.services.auth_service import hash_password


async def seed():
    await init_db()

    async with async_session() as db:
        # Admin user
        admin = User(
            email="admin@pizzaya.com.uy",
            password_hash=hash_password("Admin123!"),
            full_name="Admin PizzaYA",
            role="admin",
            phone="099123456",
        )
        db.add(admin)

        # Customer user
        customer = User(
            email="cliente@test.com",
            password_hash=hash_password("Cliente123!"),
            full_name="Juan Perez",
            role="customer",
            phone="099654321",
        )
        db.add(customer)

        # Categories
        categories_data = [
            {"name": "Pizzas", "slug": "pizzas", "description": "Pizzas artesanales al horno de barro", "display_order": 1},
            {"name": "Empanadas", "slug": "empanadas", "description": "Empanadas criollas y de sabores especiales", "display_order": 2},
            {"name": "Bebidas", "slug": "bebidas", "description": "Bebidas frias y calientes", "display_order": 3},
            {"name": "Postres", "slug": "postres", "description": "Postres caseros uruguayos", "display_order": 4},
        ]

        categories = {}
        for cdata in categories_data:
            cat = Category(**cdata)
            db.add(cat)
            categories[cdata["slug"]] = cat

        await db.flush()

        # Products
        products_data = [
            # Pizzas
            {"name": "Pizza Muzzarella", "slug": "pizza-muzzarella", "description": "Clasica pizza de muzzarella con salsa de tomate casera y oregano", "price": 380, "category_slug": "pizzas", "is_featured": True},
            {"name": "Pizza Napolitana", "slug": "pizza-napolitana", "description": "Muzzarella, tomate en rodajas, ajo y albahaca fresca", "price": 420, "category_slug": "pizzas", "is_featured": True},
            {"name": "Pizza Especial", "slug": "pizza-especial", "description": "Jamon, morrones, aceitunas y muzzarella", "price": 460, "category_slug": "pizzas", "is_featured": True},
            {"name": "Pizza Calabresa", "slug": "pizza-calabresa", "description": "Longaniza calabresa, muzzarella y aceitunas", "price": 480, "category_slug": "pizzas", "is_featured": False},
            {"name": "Pizza Fugazzeta", "slug": "pizza-fugazzeta", "description": "Cebolla caramelizada, muzzarella y oregano", "price": 430, "category_slug": "pizzas", "is_featured": False},
            {"name": "Pizza Rucula y Crudo", "slug": "pizza-rucula-crudo", "description": "Rucula fresca, jamon crudo, parmesano y oliva", "price": 550, "category_slug": "pizzas", "is_featured": True},
            {"name": "Pizza Cuatro Quesos", "slug": "pizza-cuatro-quesos", "description": "Muzzarella, parmesano, roquefort y provolone", "price": 520, "category_slug": "pizzas", "is_featured": False},
            # Empanadas
            {"name": "Empanada de Carne", "slug": "empanada-carne", "description": "Carne picada, cebolla, huevo duro y aceitunas", "price": 90, "category_slug": "empanadas", "is_featured": True},
            {"name": "Empanada de Pollo", "slug": "empanada-pollo", "description": "Pollo desmenuzado con morron y cebolla", "price": 90, "category_slug": "empanadas", "is_featured": False},
            {"name": "Empanada de Jamon y Queso", "slug": "empanada-jamon-queso", "description": "Jamon cocido y muzzarella derretida", "price": 85, "category_slug": "empanadas", "is_featured": False},
            {"name": "Empanada de Queso y Cebolla", "slug": "empanada-queso-cebolla", "description": "Muzzarella y cebolla salteada", "price": 80, "category_slug": "empanadas", "is_featured": False},
            {"name": "Docena de Empanadas Mixtas", "slug": "docena-empanadas", "description": "12 empanadas surtidas a eleccion", "price": 950, "category_slug": "empanadas", "is_featured": True},
            # Bebidas
            {"name": "Coca-Cola 500ml", "slug": "coca-cola-500", "description": "Coca-Cola de medio litro bien fria", "price": 80, "category_slug": "bebidas", "is_featured": False},
            {"name": "Agua Mineral 500ml", "slug": "agua-mineral", "description": "Agua mineral sin gas Salus", "price": 60, "category_slug": "bebidas", "is_featured": False},
            {"name": "Cerveza Patricia 1L", "slug": "cerveza-patricia", "description": "Cerveza uruguaya Patricia de litro", "price": 150, "category_slug": "bebidas", "is_featured": True},
            {"name": "Limonada Casera 500ml", "slug": "limonada-casera", "description": "Limonada natural con menta y jengibre", "price": 110, "category_slug": "bebidas", "is_featured": False},
            # Postres
            {"name": "Flan Casero", "slug": "flan-casero", "description": "Flan de huevo con caramelo, receta de la abuela", "price": 180, "category_slug": "postres", "is_featured": True},
            {"name": "Chaja Uruguayo", "slug": "chaja", "description": "Postre uruguayo clasico: bizcochuelo, crema, duraznos y merengue", "price": 320, "category_slug": "postres", "is_featured": True},
            {"name": "Volcan de Chocolate", "slug": "volcan-chocolate", "description": "Torta tibia de chocolate con corazon fundido y helado", "price": 350, "category_slug": "postres", "is_featured": False},
            {"name": "Arroz con Leche", "slug": "arroz-con-leche", "description": "Arroz con leche cremoso con canela y cascara de limon", "price": 200, "category_slug": "postres", "is_featured": False},
        ]

        for pdata in products_data:
            cat_slug = pdata.pop("category_slug")
            cat = categories[cat_slug]
            product = Product(category_id=cat.id, **pdata)
            db.add(product)

        await db.commit()
        print("Seed completado!")
        print(f"  Admin: admin@pizzaya.com.uy / Admin123!")
        print(f"  Cliente: cliente@test.com / Cliente123!")


if __name__ == "__main__":
    asyncio.run(seed())
