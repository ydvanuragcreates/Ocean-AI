from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Use a hosted database (e.g. Postgres on Neon/Supabase/Render) when DATABASE_URL
# is set; fall back to a local SQLite file for development.
SQLALCHEMY_DATABASE_URL = (os.getenv("DATABASE_URL") or "").strip() or "sqlite:///./app.db"

# Some providers hand out "postgres://" URLs, which SQLAlchemy no longer accepts
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # pool_pre_ping reconnects cleanly after the host drops idle connections
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
