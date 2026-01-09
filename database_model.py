from sqlalchemy.orm import declarative_base
from sqlalchemy import Column,Integer,String,Float

# for Mapping the py obj and tables in postgress, so we needed not create actualy querry, this sqlalchemy take care of query parts
Base  = declarative_base()

class product(Base):
    __tablename__ = "Product"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    price = Column(Float)
    quantity = Column(Integer)