import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  userId: String,
  amount: Number,
  category: String,
  note: String,
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Expense", expenseSchema);
