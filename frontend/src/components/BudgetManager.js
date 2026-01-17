import { useState, useEffect } from "react";
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

export default function BudgetManager({ refresh }) {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(false);

  const loadBudgets = async () => {
    try {
      const res = await api.get("/budgets");
      setBudgets(res.data);
    } catch (err) {
      console.error("Error loading budgets:", err);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !limit) {
      alert("Please fill in category and limit");
      return;
    }

    setLoading(true);
    try {
      await api.post("/budgets", { category, limit: parseFloat(limit) });
      setCategory("");
      setLimit("");
      loadBudgets();
      refresh();
    } catch (err) {
      console.error("Set budget error:", err);
      const msg = err.response?.data?.error || err.response?.data?.message || "Error setting budget";
      alert(msg);
      if (err.response?.status === 401) window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;
    
    try {
      await api.delete(`/budgets/${id}`);
      loadBudgets();
      refresh();
    } catch (err) {
      console.error("Delete budget error:", err);
      const msg = err.response?.data?.error || err.response?.data?.message || "Error deleting budget";
      alert(msg);
      if (err.response?.status === 401) window.location.href = "/login";
    }
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 100) return "#f44336";
    if (percentage >= 80) return "#ff9800";
    return "#4CAF50";
  };

  return (
    <div>
      <div style={styles.formContainer}>
        <h3 style={styles.title}>Set Budget</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={styles.input}
              required
            >
              <option value="">Select Category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Monthly Limit (₹)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? "Saving..." : "Set Budget"}
          </button>
        </form>
      </div>

      <div style={styles.budgetsContainer}>
        <h3 style={styles.title}>Your Budgets ({budgets.length})</h3>
        {budgets.length === 0 ? (
          <div style={styles.empty}>No budgets set yet. Set your first budget above!</div>
        ) : (
          <div style={styles.budgetsList}>
            {budgets.map((budget) => {
              const percentage = parseFloat(budget.percentage);
              const isOver = percentage >= 100;
              
              return (
                <div key={budget._id} style={styles.budgetCard}>
                  <div style={styles.budgetHeader}>
                    <div>
                      <div style={styles.budgetCategory}>{budget.category}</div>
                      <div style={styles.budgetLimit}>Limit: ₹{budget.limit.toFixed(2)}</div>
                    </div>
                    <button
                      onClick={() => handleDelete(budget._id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div style={styles.progressContainer}>
                    <div style={styles.progressInfo}>
                      <span>Spent: ₹{budget.spent.toFixed(2)}</span>
                      <span style={{ color: getPercentageColor(percentage) }}>
                        {percentage}%
                      </span>
                    </div>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: getPercentageColor(percentage)
                        }}
                      />
                    </div>
                    <div style={styles.remaining}>
                      {isOver ? (
                        <span style={{ color: "#f44336" }}>
                          Over by ₹{Math.abs(budget.remaining).toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ color: "#4CAF50" }}>
                          Remaining: ₹{budget.remaining.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  formContainer: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "24px"
  },
  budgetsContainer: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  title: {
    margin: "0 0 20px 0",
    color: "#333",
    fontSize: "20px",
    fontWeight: "600"
  },
  form: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-end"
  },
  inputGroup: {
    flex: 1
  },
  label: {
    display: "block",
    marginBottom: "6px",
    color: "#555",
    fontSize: "14px",
    fontWeight: "500"
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box"
  },
  submitButton: {
    padding: "10px 24px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    height: "fit-content"
  },
  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#999"
  },
  budgetsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  budgetCard: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "16px"
  },
  budgetHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px"
  },
  budgetCategory: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "4px"
  },
  budgetLimit: {
    fontSize: "14px",
    color: "#666"
  },
  deleteButton: {
    padding: "6px 12px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer"
  },
  progressContainer: {
    marginTop: "12px"
  },
  progressInfo: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "500"
  },
  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "#e0e0e0",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "8px"
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease"
  },
  remaining: {
    fontSize: "12px",
    fontWeight: "500"
  }
};

