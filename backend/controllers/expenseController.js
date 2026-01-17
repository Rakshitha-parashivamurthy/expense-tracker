import Expense from "../models/Expense.js";

export const addExpense = async (req, res) => {
  try {
    const expense = await Expense.create({
      userId: req.user.id,
      ...req.body
    });
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { month, year, category } = req.query;
    let query = { userId: req.user.id };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    if (category) {
      query.category = category;
    }
    
    const data = await Expense.find(query).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const { month, year } = req.query;
    let dateQuery = { userId: req.user.id };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      dateQuery.date = { $gte: startDate, $lte: endDate };
    }
    
    // Total expenses
    const totalExpenses = await Expense.aggregate([
      { $match: dateQuery },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    // Expenses by category
    const byCategory = await Expense.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);
    
    // Monthly expenses (last 6 months)
    const monthlyExpenses = await Expense.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 }
    ]);
    
    res.json({
      totalExpenses: totalExpenses[0]?.total || 0,
      byCategory,
      monthlyExpenses
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
