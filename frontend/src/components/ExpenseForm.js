import { useState } from "react";
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

export default function ExpenseForm({ refresh, editingExpense, onCancel }) {
  const [amount, setAmount] = useState(editingExpense?.amount || "");
  const [category, setCategory] = useState(editingExpense?.category || "");
  const [note, setNote] = useState(editingExpense?.note || "");
  const [date, setDate] = useState(
    editingExpense?.date ? new Date(editingExpense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    if (!amount || !category) {
      alert("Please fill in amount and category");
      return;
    }
    
    setLoading(true);
    try {
      const data = {
        amount: parseFloat(amount),
        category,
        note,
        date: new Date(date)
      };
      
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense._id}`, data);
      } else {
        await api.post("/expenses", data);
      }
      
      setAmount("");
      setCategory("");
      setNote("");
      setDate(new Date().toISOString().split('T')[0]);
      refresh();
      if (onCancel) onCancel();
    } catch (err) {
      alert(err.response?.data?.error || "Error saving expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={styles.form}>
      <h3 style={styles.title}>{editingExpense ? "Edit Expense" : "Add New Expense"}</h3>
      <div style={styles.inputGroup}>
        <label style={styles.label}>Amount (₹)</label>
        <input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={styles.input}
          required
        />
      </div>
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
        <label style={styles.label}>Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={styles.input}
          required
        />
      </div>
      <div style={styles.inputGroup}>
        <label style={styles.label}>Note</label>
        <input
          placeholder="Optional note"
          value={note}
          onChange={e => setNote(e.target.value)}
          style={styles.input}
        />
      </div>
      <div style={styles.buttonGroup}>
        <button type="submit" style={styles.submitButton} disabled={loading}>
          {loading ? "Saving..." : editingExpense ? "Update" : "Add Expense"}
        </button>
        {editingExpense && (
          <button type="button" onClick={onCancel} style={styles.cancelButton}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

const styles = {
  form: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "24px"
  },
  title: {
    margin: "0 0 20px 0",
    color: "#333",
    fontSize: "20px",
    fontWeight: "600"
  },
  inputGroup: {
    marginBottom: "16px"
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
  buttonGroup: {
    display: "flex",
    gap: "10px"
  },
  submitButton: {
    padding: "10px 24px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    flex: 1
  },
  cancelButton: {
    padding: "10px 24px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer"
  }
};
