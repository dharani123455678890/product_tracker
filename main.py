from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from model import product   # Pydantic model
from database import session, engine
import database_model       # SQLAlchemy model

app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------- DB INIT ----------------
database_model.Base.metadata.create_all(bind=engine)

def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()

# -------- Seed initial data ----------
def init_db():
    db = session()
    if db.query(database_model.product).count() == 0:
        initial = [
            product(id=1, name="Phone", description="Budget Android Phone", price=99, quantity=10),
            product(id=2, name="Laptop", description="Student Laptop", price=599, quantity=5),
        ]
        for p in initial:
            db.add(database_model.product(**p.model_dump()))
        db.commit()
    db.close()

init_db()

# ---------------- API ------------------

@app.get("/")
def greet():
    return {"message": "Welcome"}

# ✅ GET ALL
@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(database_model.product).all()

# ✅ GET ONE
@app.get("/products/{id}")
def get_product(id: int, db: Session = Depends(get_db)):
    product_db = db.query(database_model.product).filter_by(id=id).first()
    if not product_db:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_db

# ✅ CREATE
@app.post("/products")
def add_product(p: product, db: Session = Depends(get_db)):
    if db.query(database_model.product).filter_by(id=p.id).first():
        raise HTTPException(status_code=400, detail="Product already exists")

    db.add(database_model.product(**p.model_dump()))
    db.commit()
    return {"message": "Product added"}

# ✅ UPDATE
@app.put("/products/{id}")
def update_product(id: int, p: product, db: Session = Depends(get_db)):
    db_product = db.query(database_model.product).filter_by(id=id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    db_product.name = p.name
    db_product.description = p.description
    db_product.price = p.price
    db_product.quantity = p.quantity
    db.commit()
    return {"message": "Product updated"}

# ✅ DELETE
@app.delete("/products/{id}")
def delete_product(id: int, db: Session = Depends(get_db)):
    db_product = db.query(database_model.product).filter_by(id=id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted"}
