import express from "express";
import auth from "../middleware/auth.js";
import { addExpense, getExpenses, updateExpense, deleteExpense, getAnalytics } from "../controllers/expenseController.js";

const router = express.Router();

router.post("/", auth, addExpense);
router.get("/", auth, getExpenses);
router.get("/analytics", auth, getAnalytics);
router.put("/:id", auth, updateExpense);
router.delete("/:id", auth, deleteExpense);

export default router;
