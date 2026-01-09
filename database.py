from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

db_url = "postgresql://postgres:******@localhost:5432/fastapi_learn"
engine = create_engine(db_url)
session = sessionmaker(autocommit=False,autoflush=False,bind=engine)
