"""Seed script to create initial admin user and test data."""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.models.base import init_db, engine, get_db
from app.models.user import User
from app.models.text_process import TextProcess
from app.auth.security import hash_password, generate_api_key


def create_admin_user():
    db = next(get_db())
    try:
        existing = db.query(User).filter(User.username == "admin").first()
        if existing:
            print("Admin user already exists")
            return existing

        api_key = generate_api_key()
        user = User(
            email="admin@zilp.ai",
            username="admin",
            hashed_password=hash_password("admin123!"),
            is_active=True,
            is_superuser=True,
            role="admin",
            api_key=api_key,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created admin user: {user.username}")
        print(f"API Key: {api_key}")
        return user
    finally:
        db.close()


def create_demo_user():
    db = next(get_db())
    try:
        existing = db.query(User).filter(User.username == "demo").first()
        if existing:
            print("Demo user already exists")
            return existing

        api_key = generate_api_key()
        user = User(
            email="demo@zilp.ai",
            username="demo",
            hashed_password=hash_password("demo1234!"),
            is_active=True,
            role="user",
            api_key=api_key,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created demo user: {user.username}")
        print(f"API Key: {api_key}")
        return user
    finally:
        db.close()


def main():
    print("Initializing database...")
    init_db(engine)

    print("Creating seed data...")
    create_admin_user()
    create_demo_user()

    print("Seed complete!")
    print("\nLogin credentials:")
    print("  Admin: admin / admin123!")
    print("  Demo:  demo  / demo1234!")


if __name__ == "__main__":
    main()
