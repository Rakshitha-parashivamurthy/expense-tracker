import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";

export const setBudget = async (req, res) => {
  try {
    // Check if budget for this category already exists
    const existing = await Budget.findOne({
      userId: req.user.id,
      category: req.body.category
    });
    
    if (existing) {
      existing.limit = req.body.limit;
      await existing.save();
      return res.json(existing);
    }
    
    const budget = await Budget.create({
      userId: req.user.id,
      ...req.body
    });
    res.json(budget);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    
    // Get current month expenses by category
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const expenses = await Expense.aggregate([
      {
        $match: {
          userId: req.user.id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);
    
    const expenseMap = {};
    expenses.forEach(e => {
      expenseMap[e._id] = e.total;
    });
    
    const budgetsWithSpending = budgets.map(budget => ({
      ...budget.toObject(),
      spent: expenseMap[budget.category] || 0,
      remaining: budget.limit - (expenseMap[budget.category] || 0),
      percentage: ((expenseMap[budget.category] || 0) / budget.limit * 100).toFixed(1)
    }));
    
    res.json(budgetsWithSpending);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!budget) return res.status(404).json({ error: "Budget not found" });
    res.json(budget);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!budget) return res.status(404).json({ error: "Budget not found" });
    res.json({ message: "Budget deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
