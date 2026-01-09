import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./App.css";
import TaglineSection from "./TaglineSection";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    quantity: "",
  });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(t);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await api.get("/products/");
        setProducts(res.data);
      } catch {
        setError("Failed to fetch products");
      }
      setLoading(false);
    };
    run();
  }, []);

  /* -------------------- API -------------------- */
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/");
      setProducts(res.data);
    } catch {
      setError("Failed to fetch products");
    }
    setLoading(false);
  };

  /* -------------------- Sorting & Filter -------------------- */
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredProducts = useMemo(() => {
    let list = [...products];
    const q = filter.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (p) =>
          String(p.id).includes(q) ||
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => {
      let A = a[sortField];
      let B = b[sortField];

      if (["id", "price", "quantity"].includes(sortField)) {
        A = Number(A);
        B = Number(B);
      } else {
        A = String(A).toLowerCase();
        B = String(B).toLowerCase();
      }

      if (A < B) return sortDirection === "asc" ? -1 : 1;
      if (A > B) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [products, filter, sortField, sortDirection]);

  /* -------------------- Form -------------------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ id: "", name: "", description: "", price: "", quantity: "" });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (editId) {
        await api.put(`/products/${editId}`, {
          ...form,
          id: Number(form.id),
          price: Number(form.price),
          quantity: Number(form.quantity),
        });
        setMessage("Product updated successfully");
      } else {
        await api.post("/products/", {
          ...form,
          id: Number(form.id),
          price: Number(form.price),
          quantity: Number(form.quantity),
        });
        setMessage("Product created successfully");
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || "Operation failed");
    }

    setLoading(false);
  };

  const handleEdit = (p) => {
    setForm(p);
    setEditId(p.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setLoading(true);

    try {
      await api.delete(`/products/${id}`);
      setMessage("Product deleted");
      fetchProducts();
    } catch {
      setError("Delete failed");
    }

    setLoading(false);
  };

  const currency = (n) => Number(n || 0).toFixed(2);

  /* ==================== JSX ==================== */
return (
  <div className="app">
    {/* ===== STORE HEADER ===== */}
    <header className="store-header">
      <h1>MD Store</h1>
    </header>

    {/* ===== SEARCH BAR ===== */}
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search products..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
    </div>

    {/* ===== MAIN CONTENT ===== */}
    <div className="main-layout">
      
      {/* ===== LEFT : PRODUCT LIST ===== */}
      <div className="list-section">
        <h2>Products</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort("id")}>ID</th>
                <th onClick={() => handleSort("name")}>Name</th>
                <th>Description</th>
                <th onClick={() => handleSort("price")}>Price</th>
                <th onClick={() => handleSort("quantity")}>Qty</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.description}</td>
                  <td>${currency(p.price)}</td>
                  <td>{p.quantity}</td>
                  <td>
                    <button onClick={() => handleEdit(p)}>Edit</button>
                    <button onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ===== RIGHT : ADD / EDIT BOX ===== */}
      <div className="form-section">
        <h2>{editId ? "Edit Product" : "Add Product"}</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="id"
            type="number"
            placeholder="ID"
            value={form.id}
            onChange={handleChange}
            disabled={!!editId}
            required
          />

          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />

          <input
            name="price"
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
          />

          <input
            name="quantity"
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            required
          />

          <button type="submit">
            {editId ? "Update" : "Add"}
          </button>

          {editId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </form>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>

    </div>
  </div>
);

}

export default App;
