import { useState, useMemo } from "react";
import api from "../api";

const CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Healthcare",
  "Education",
  "Travel",
  "Personal Care",
  "Other"
];

export default function ExpenseList({ data, refresh, onEdit }) {
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    
    setDeleting(id);
    try {
      await api.delete(`/expenses/${id}`);
      refresh();
    } catch (err) {
      alert(err.response?.data?.error || "Error deleting expense");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.note && expense.note.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (filterCategory) {
      filtered = filtered.filter(expense => expense.category === filterCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === "date-asc") {
        return new Date(a.date) - new Date(b.date);
      } else if (sortBy === "amount-desc") {
        return b.amount - a.amount;
      } else if (sortBy === "amount-asc") {
        return a.amount - b.amount;
      }
      return 0;
    });

    return filtered;
  }, [data, searchTerm, filterCategory, sortBy]);

  const totalFiltered = filteredAndSortedData.reduce((sum, exp) => sum + exp.amount, 0);

  if (data.length === 0) {
    return (
      <div style={styles.empty}>
        <p>No expenses yet. Add your first expense above!</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Your Expenses ({filteredAndSortedData.length} of {data.length})</h3>
        {filteredAndSortedData.length > 0 && (
          <div style={styles.total}>Total: ₹{totalFiltered.toFixed(2)}</div>
        )}
      </div>

      <div style={styles.filters}>
        <input
          type="text"
          placeholder="🔍 Search by category or note..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
        {(searchTerm || filterCategory) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterCategory("");
            }}
            style={styles.clearButton}
          >
            Clear Filters
          </button>
        )}
      </div>

      {filteredAndSortedData.length === 0 ? (
        <div style={styles.empty}>
          <p>No expenses match your filters. Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {filteredAndSortedData.map((expense) => (
            <div key={expense._id} style={styles.card}>
              <div style={styles.cardContent}>
                <div style={styles.left}>
                  <div style={styles.category}>{expense.category}</div>
                  <div style={styles.note}>{expense.note || "No note"}</div>
                  <div style={styles.date}>{formatDate(expense.date)}</div>
                </div>
                <div style={styles.right}>
                  <div style={styles.amount}>₹{parseFloat(expense.amount).toFixed(2)}</div>
                  <div style={styles.actions}>
                    <button
                      onClick={() => onEdit(expense)}
                      style={styles.editButton}
                      disabled={deleting === expense._id}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      style={styles.deleteButton}
                      disabled={deleting === expense._id}
                    >
                      {deleting === expense._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  title: {
    margin: 0,
    color: "#333",
    fontSize: "20px",
    fontWeight: "600"
  },
  total: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#f44336"
  },
  filters: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap"
  },
  searchInput: {
    flex: 1,
    minWidth: "200px",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px"
  },
  filterSelect: {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer"
  },
  clearButton: {
    padding: "10px 16px",
    backgroundColor: "#f5f5f5",
    color: "#666",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "500"
  },
  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#999",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  card: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "16px",
    transition: "box-shadow 0.2s"
  },
  cardContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  left: {
    flex: 1
  },
  category: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "4px"
  },
  note: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "4px"
  },
  date: {
    fontSize: "12px",
    color: "#999"
  },
  right: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px"
  },
  amount: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#f44336"
  },
  actions: {
    display: "flex",
    gap: "8px"
  },
  editButton: {
    padding: "6px 12px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer"
  },
  deleteButton: {
    padding: "6px 12px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer"
  }
};
