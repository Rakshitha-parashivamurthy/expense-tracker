import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import BudgetManager from "../components/BudgetManager";
import FinancialReports from "../components/FinancialReports";
import Navbar from "../components/Navbar";
import api from "../api";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("expenses");
  const [editingExpense, setEditingExpense] = useState(null);
  const [summary, setSummary] = useState({ totalExpenses: 0, totalBudgets: 0, recentCount: 0 });
  const [dateFilter, setDateFilter] = useState("all"); // all, month, year, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    load();
    loadSummary();
  }, [navigate, dateFilter, customStartDate, customEndDate]);

  const load = async () => {
    try {
      const params = {};
      const now = new Date();
      
      if (dateFilter === "month") {
        params.month = now.getMonth() + 1;
        params.year = now.getFullYear();
      } else if (dateFilter === "year") {
        params.year = now.getFullYear();
      } else if (dateFilter === "custom" && customStartDate && customEndDate) {
        // For custom date range, we'll filter on the frontend
        // Backend doesn't support custom date ranges directly
      }
      
      const res = await api.get("/expenses", { params });
      let expenses = res.data;
      
      // Apply custom date range filter if needed
      if (dateFilter === "custom" && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        expenses = expenses.filter(exp => {
          const expDate = new Date(exp.date);
          return expDate >= start && expDate <= end;
        });
      }
      
      setData(expenses);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const loadSummary = async () => {
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const [expensesRes, budgetsRes, analyticsRes] = await Promise.all([
        api.get("/expenses", { params: { month: now.getMonth() + 1, year: now.getFullYear() } }),
        api.get("/budgets"),
        api.get("/expenses/analytics", { params: { month: now.getMonth() + 1, year: now.getFullYear() } })
      ]);
      
      setSummary({
        totalExpenses: analyticsRes.data.totalExpenses || 0,
        totalBudgets: budgetsRes.data.length,
        recentCount: expensesRes.data.length
      });
    } catch (err) {
      console.error("Error loading summary:", err);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setActiveTab("expenses");
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const refreshAll = () => {
    load();
    loadSummary();
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        {activeTab === "expenses" && (
          <div style={styles.summaryCards}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryIcon}>💰</div>
              <div style={styles.summaryContent}>
                <div style={styles.summaryLabel}>This Month</div>
                <div style={styles.summaryValue}>₹{summary.totalExpenses.toFixed(2)}</div>
              </div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryIcon}>📊</div>
              <div style={styles.summaryContent}>
                <div style={styles.summaryLabel}>Transactions</div>
                <div style={styles.summaryValue}>{summary.recentCount}</div>
              </div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryIcon}>🎯</div>
              <div style={styles.summaryContent}>
                <div style={styles.summaryLabel}>Active Budgets</div>
                <div style={styles.summaryValue}>{summary.totalBudgets}</div>
              </div>
            </div>
          </div>
        )}

        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "expenses" ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab("expenses")}
          >
            💸 Expenses
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "budgets" ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab("budgets")}
          >
            🎯 Budgets
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "reports" ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab("reports")}
          >
            📈 Reports
          </button>
        </div>

        <div style={styles.tabContent}>
          {activeTab === "expenses" && (
            <div>
              <ExpenseForm
                refresh={refreshAll}
                editingExpense={editingExpense}
                onCancel={handleCancelEdit}
              />
              
              <div style={styles.dateFilterContainer}>
                <label style={styles.filterLabel}>Filter by Date:</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={styles.dateFilterSelect}
                >
                  <option value="all">All Time</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
                
                {dateFilter === "custom" && (
                  <div style={styles.customDateRange}>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      style={styles.dateInput}
                      placeholder="Start Date"
                    />
                    <span style={styles.dateSeparator}>to</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      style={styles.dateInput}
                      placeholder="End Date"
                    />
                  </div>
                )}
              </div>
              
              <ExpenseList
                data={data}
                refresh={refreshAll}
                onEdit={handleEdit}
              />
            </div>
          )}

          {activeTab === "budgets" && (
            <BudgetManager refresh={refreshAll} />
          )}

          {activeTab === "reports" && <FinancialReports />}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5"
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px"
  },
  summaryCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "24px"
  },
  summaryCard: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  summaryIcon: {
    fontSize: "40px"
  },
  summaryContent: {
    flex: 1
  },
  summaryLabel: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "4px"
  },
  summaryValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#333"
  },
  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    backgroundColor: "#fff",
    padding: "8px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  tab: {
    flex: 1,
    padding: "12px 24px",
    border: "none",
    backgroundColor: "transparent",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    color: "#666",
    transition: "all 0.2s"
  },
  activeTab: {
    backgroundColor: "#2196F3",
    color: "#fff"
  },
  tabContent: {
    animation: "fadeIn 0.3s"
  },
  dateFilterContainer: {
    backgroundColor: "#fff",
    padding: "16px 24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap"
  },
  filterLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#555"
  },
  dateFilterSelect: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer"
  },
  customDateRange: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1
  },
  dateInput: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px"
  },
  dateSeparator: {
    color: "#666",
    fontSize: "14px"
  }
};
