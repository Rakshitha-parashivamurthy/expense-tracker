import express from "express";
import auth from "../middleware/auth.js";
import { setBudget, getBudgets, updateBudget, deleteBudget } from "../controllers/budgetController.js";

const router = express.Router();

router.post("/", auth, setBudget);
router.get("/", auth, getBudgets);
router.put("/:id", auth, updateBudget);
router.delete("/:id", auth, deleteBudget);

export default router;
