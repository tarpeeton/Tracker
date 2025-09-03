"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  BadgePlus,
  Plus,
  Wallet,
  Gift,
  X
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import { DashboardStore } from "@/store/Dashboard";
import {COLORS, DUMMY_DATA } from "@/Constants/Dashboard";
import { IncomeModal } from "../Modals/Dashboard/IncomeModal";
import { ExpenceModal } from "../Modals/Dashboard/ExpenceModal";
import { GoalModal } from "../Modals/Dashboard/GoalModal";
import { UserStore } from "@/store/UserStore";
import { useChartData } from "@/hooks/useChartData";




export const Main = () => {
  const [incomeModal, setIncomeModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);
  const [goalModal, setGoalModal] = useState(false);

  const { user } = UserStore();
  const {
    currentBalance,
    expences,
    goals,
    totalExpence,
    totalProfit,
    balanceHistory,
    initialize,
    deleteGoal,
  } = DashboardStore();

  useEffect(() => {
    if (user.user_id) {
      initialize();
    }
  }, [user.user_id, initialize]);



  const transformedExpenseData = useMemo(() => {
    return expences.map((item) => ({
      price: item.price,
      category: item.category,
    }));
  }, [expences]);


  // Modal handlers
  const handleIncomeModalOpen = useCallback(() => setIncomeModal(true), []);
  const handleExpenseModalOpen = useCallback(() => setExpenseModal(true), []);
  const handleGoalModalOpen = useCallback(() => setGoalModal(true), []);

  const handleIncomeModalClose = useCallback(() => {
    setIncomeModal(false);
  }, []);

  const handleExpenseModalClose = useCallback(() => {
    setExpenseModal(false);
  }, []);

  const handleGoalModalClose = useCallback(() => {
    setGoalModal(false);
  }, []);

  const goalsWithProgress = useMemo(() => {
    return goals.map((goal) => ({
      ...goal,
      percent: Math.floor((goal.balance / goal.price) * 100),
    }));
  }, [goals]);


  const chartData = useChartData(balanceHistory);





  return (
    <section className="p-10 w-full min-h-screen bg-[#1f1f1f]">
      {/* Summary Cards */}
      <div className="grid lg:grid-cols-3 gap-6 mb-16 mt-10">
        <article className="bg-[#2b2a2a] border border-gray-700 rounded-lg p-5 hover:scale-105 duration-150 ease-in">
          <div className="flex justify-between items-center">
            <p className="text-white lg:text-[21px]">Общий доход</p>
            <TrendingUp className="text-green-500" />
          </div>
          <div className="mt-6">
            <span className="text-green-500 lg:text-[21px]">
              {totalProfit.toLocaleString()} сом
            </span>
          </div>
        </article>

        <article className="bg-[#2b2a2a] border border-gray-700 rounded-lg p-5 hover:scale-105 duration-150 ease-in">
          <div className="flex justify-between items-center">
            <p className="text-white lg:text-[21px]">Общие расходы</p>
            <TrendingDown className="text-red-500" />
          </div>
          <div className="mt-6">
            <span className="text-red-500 lg:text-[21px]">
              {totalExpence.toLocaleString()} сом
            </span>
          </div>
        </article>

        <article className="bg-[#2b2a2a] border border-gray-700 rounded-lg p-5 hover:scale-105 duration-150 ease-in">
          <div className="flex justify-between items-center">
            <p className="text-white lg:text-[21px]">Баланс</p>
            <div className="flex items-center gap-4">
              <TrendingUp className="text-green-500" />
              <button className="cursor-pointer">
                <BadgePlus className="text-white" />
              </button>
            </div>
          </div>
          <div className="mt-6">
            <span className="text-green-500 lg:text-[21px]">
              {currentBalance.price.toLocaleString()} сом
            </span>
          </div>
        </article>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col lg:flex-row gap-6 mb-16">
        <button
          onClick={handleIncomeModalOpen}
          className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 transition duration-200 rounded-lg px-6 py-4 text-white font-semibold shadow-md"
        >
          <Plus className="w-5 h-5" />
          Добавить доход
        </button>

        <button
          onClick={handleExpenseModalOpen}
          className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 transition duration-200 rounded-lg px-6 py-4 text-white font-semibold shadow-md"
        >
          <Wallet className="w-5 h-5" />
          Добавить расход
        </button>

        <button
          onClick={handleGoalModalOpen}
          className="flex items-center justify-center gap-3 bg-yellow-600 hover:bg-yellow-500 transition duration-200 rounded-lg px-6 py-4 text-white font-semibold shadow-md"
        >
          <Gift className="w-5 h-5" />
          Добавить цель
        </button>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-16">
        <div className="bg-[#2b2a2a] p-5 rounded-lg shadow-md">
          <h2 className="text-white mb-5 text-lg font-semibold">Доход</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="month" stroke="#fff" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  border: "none",
                  borderRadius: 8,
                }}
                itemStyle={{ color: "#fff" }}
                formatter={(value: number) => [
                  `${value.toLocaleString()} сом`,
                  "Доход",
                ]}
              />
              <Bar dataKey="income" fill="#8884d8" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#2b2a2a] p-5 rounded-lg shadow-md">
          <h2 className="text-white mb-5 text-lg font-semibold">
            Распределение расходов по категориям
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={
                  expences && expences.length > 0
                    ? transformedExpenseData
                    : DUMMY_DATA
                }
                dataKey="price"
                nameKey="category"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={5}
                isAnimationActive={false}
              >
                {(expences && expences.length > 0 ? expences : DUMMY_DATA).map(
                  (_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  )
                )}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  border: "none",
                  borderRadius: 8,
                }}
                itemStyle={{ color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Goals Section */}
      <div className="bg-[#2b2a2a] p-5 rounded-lg shadow-md mb-16">
        <h2 className="text-white mb-5 text-lg font-semibold">Активные цели</h2>
        {goalsWithProgress.map((goal, idx) => (
          <div key={`goal-${goal.name}-${idx}`} className="mb-5">
            <div className="flex flex-row items-center justify-between mb-4">
              <p className="text-white font-semibold">{goal.name}</p>
              <button
                onClick={() => deleteGoal(goal.id)}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-6 mb-2 overflow-hidden">
              <div
                className="bg-yellow-500 h-6 rounded-full transition-all duration-500"
                style={{ width: `${goal.percent}%` }}
              />
            </div>

            <p className="text-white text-sm">
              {goal.balance.toLocaleString()} из {goal.price.toLocaleString()}{" "}
              сом ({goal.percent}%)
            </p>
          </div>
        ))}
      </div>

      {/* History Section */}
      <div className="bg-[#2b2a2a] p-5 rounded-lg shadow-md">
        <h2 className="text-white mb-5 text-lg font-semibold">
          История транзакций
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-white table-auto border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-2 text-left">Дата</th>
                <th className="px-4 py-2 text-left">Тип</th>
                <th className="px-4 py-2 text-left">Категория</th>
                <th className="px-4 py-2 text-left">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {expences?.map((t, idx) => (
                <tr
                  key={`expense-${t.date}-${idx}`}
                  className="border-b border-gray-700"
                >
                  <td className="px-4 py-2">{t.date.split(",")[0]}</td>
                  <td className="px-4 py-2">{t.category}</td>
                  <td className="px-4 py-2">{t.category}</td>
                  <td className="px-4 py-2">{t.price.toLocaleString()} сом</td>
                </tr>
              )) || []}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {incomeModal && <IncomeModal setIncomeModal={handleIncomeModalClose} />}

      {expenseModal && (
        <ExpenceModal setExpenseModal={handleExpenseModalClose} goals={goals} />
      )}

      {goalModal && <GoalModal setGoalModal={handleGoalModalClose} />}
    </section>
  );
};
