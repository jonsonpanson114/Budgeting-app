import { create } from 'zustand';

interface BudgetState {
  monthlyBudget: number;
  setMonthlyBudget: (budget: number) => void;
  categoryBudgets: CategoryBudget[];
  setCategoryBudgets: (budgets: CategoryBudget[]) => void;
  updateCategoryBudget: (id: string, updates: Partial<CategoryBudget>) => void;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  monthlyBudget: 80000,
  setMonthlyBudget: (budget) => set({ monthlyBudget: budget }),
  categoryBudgets: [],
  setCategoryBudgets: (budgets) => set({ categoryBudgets: budgets }),
  updateCategoryBudget: (id, updates) =>
    set((state) => ({
      categoryBudgets: state.categoryBudgets.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    })),
}));
