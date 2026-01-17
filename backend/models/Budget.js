import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  userId: String,
  category: String,
  limit: Number
});

export default mongoose.model("Budget", budgetSchema);
