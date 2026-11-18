from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Use a hosted database (e.g. Postgres on Neon/Supabase/Render) when DATABASE_URL
# is set; fall back to a local SQLite file for development.
SQLALCHEMY_DATABASE_URL = (os.getenv("DATABASE_URL") or "").strip() or "sqlite:///./app.db"

# Providers hand out several spellings ("postgres://", "postgresql://",
# "postgresql+psycopg://"...). Normalise them all to the psycopg2 driver,
# which is the one listed in requirements.txt.
_scheme, _sep, _rest = SQLALCHEMY_DATABASE_URL.partition("://")
if _sep and _scheme.split("+")[0] in ("postgres", "postgresql"):
    SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://" + _rest

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
