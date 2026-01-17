import { useState, useEffect } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import api from "../api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function FinancialReports() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/expenses/analytics", {
        params: { month: selectedMonth, year: selectedYear }
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedMonth, selectedYear]);

  if (loading) {
    return <div style={styles.loading}>Loading reports...</div>;
  }

  if (!analytics) {
    return <div style={styles.empty}>No data available</div>;
  }

  const categoryData = {
    labels: analytics.byCategory.map(item => item._id),
    datasets: [
      {
        label: "Expenses by Category",
        data: analytics.byCategory.map(item => item.total),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#FF6384",
          "#C9CBCF",
          "#4BC0C0",
          "#FF6384"
        ]
      }
    ]
  };

  const monthlyData = {
    labels: analytics.monthlyExpenses
      .reverse()
      .map(item => `${item._id.month}/${item._id.year}`),
    datasets: [
      {
        label: "Monthly Expenses (₹)",
        data: analytics.monthlyExpenses.map(item => item.total),
        borderColor: "#2196F3",
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        tension: 0.4
      }
    ]
  };

  const categoryBarData = {
    labels: analytics.byCategory.map(item => item._id),
    datasets: [
      {
        label: "Amount (₹)",
        data: analytics.byCategory.map(item => item.total),
        backgroundColor: "#4CAF50"
      }
    ]
  };

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const exportToCSV = () => {
    const csvRows = [];
    csvRows.push("Category,Total Amount,Transactions");
    analytics.byCategory.forEach(item => {
      csvRows.push(`${item._id},${item.total.toFixed(2)},${item.count}`);
    });
    csvRows.push(`\nTotal Expenses,${analytics.totalExpenses.toFixed(2)},`);
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expense-report-${selectedMonth}-${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Financial Reports</h2>
        <div style={styles.headerRight}>
          <div style={styles.filters}>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(parseInt(e.target.value))}
            style={styles.select}
          >
            {months.map(month => (
              <option key={month} value={month}>
                {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            style={styles.select}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button onClick={exportToCSV} style={styles.exportButton}>
            📥 Export CSV
          </button>
          </div>
        </div>
      </div>

      <div style={styles.summary}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Total Expenses</div>
          <div style={styles.summaryValue}>
            ₹{analytics.totalExpenses.toFixed(2)}
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Categories</div>
          <div style={styles.summaryValue}>{analytics.byCategory.length}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Top Category</div>
          <div style={styles.summaryValue}>
            {analytics.byCategory[0]?._id || "N/A"}
          </div>
        </div>
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Expenses by Category</h3>
          <div style={styles.chartContainer}>
            <Doughnut
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: "bottom"
                  }
                }
              }}
            />
          </div>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Category Breakdown</h3>
          <div style={styles.chartContainer}>
            <Bar
              data={categoryBarData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Monthly Trend (Last 6 Months)</h3>
        <div style={styles.chartContainer}>
          <Line
            data={monthlyData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </div>

      <div style={styles.tableCard}>
        <h3 style={styles.chartTitle}>Category Details</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Total Amount</th>
              <th style={styles.th}>Transactions</th>
            </tr>
          </thead>
          <tbody>
            {analytics.byCategory.map((item, index) => (
              <tr key={index}>
                <td style={styles.td}>{item._id}</td>
                <td style={styles.td}>₹{item.total.toFixed(2)}</td>
                <td style={styles.td}>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },
  title: {
    margin: 0,
    color: "#333",
    fontSize: "24px",
    fontWeight: "600"
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  filters: {
    display: "flex",
    gap: "12px"
  },
  exportButton: {
    padding: "8px 16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s"
  },
  select: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px"
  },
  summary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px"
  },
  summaryCard: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center"
  },
  summaryLabel: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "8px"
  },
  summaryValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#333"
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "24px",
    marginBottom: "24px"
  },
  chartCard: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "24px"
  },
  chartTitle: {
    margin: "0 0 20px 0",
    color: "#333",
    fontSize: "18px",
    fontWeight: "600"
  },
  chartContainer: {
    height: "300px",
    position: "relative"
  },
  tableCard: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    padding: "12px",
    textAlign: "left",
    borderBottom: "2px solid #e0e0e0",
    color: "#333",
    fontWeight: "600"
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e0e0e0",
    color: "#666"
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    color: "#999"
  },
  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#999"
  }
};

