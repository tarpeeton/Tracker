"use client";
import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  BadgePlus,
  Plus,
  Wallet,
  Gift,
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
import { MONTHS, COLORS, DUMMY_DATA, WEEK_DAYS } from "@/Constants/Dashboard";
import { IncomeModal } from "../Modals/Dashboard/IncomeModal";
import { ExpenceModal } from "../Modals/Dashboard/ExpenceModal";
import { GoalModal } from "../Modals/Dashboard/GoalModal";
import { UserStore } from "@/store/UserStore";

export const Main = () => {
  const [incomeModal, setIncomeModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);
  const [goalModal, setGoalModal] = useState(false);
  const { user } = UserStore();
  const {
    addBalance,
    currentBalance,
    addExpence,
    expences,
    addGoal,
    goals,
    totalExpence,
    totalProfit,
    balanceHistory,
    initialize,
  } = DashboardStore();

  useEffect(() => {
    if (user.user_id) {
      initialize();
    }
  }, [user]);

  const [balance, setBalance] = useState({ price: 0, date: "" });
  const [expenceState, setExpenceState] = useState({
    price: 0,
    category: "",
    goalID: "",
    date: "",
  });
  const [goalState, setGoalState] = useState({ price: 0, name: "" });
  const transFormedData = expences.map((item) => ({
    price: item.price,
    category: item.category,
  }));

  const currentMonthIndex = new Date().getMonth();
  const monthlyIncomes: number[] = new Array(12).fill(0);

  if (balanceHistory && balanceHistory.length > 0) {
    balanceHistory.forEach((b) => {
      if (b.date) {
        const [datePart, timePart] = b.date.split(", ");
        const [day, month, year] = datePart.split(".").map(Number);
        const [hours, minutes, seconds] = timePart.split(":").map(Number);

        const jsDate = new Date(year, month - 1, day, hours, minutes, seconds);
        const monthIndex = jsDate.getMonth();

        monthlyIncomes[monthIndex] += b.price;
      }
    });
  }


  const chartData = MONTHS.map((month, index) => {
    return {
      month,
      income: monthlyIncomes[index],
      isCurrent: index === currentMonthIndex,
    };
  });


  const handleBalanceCreate = () => {
    addBalance(balance.price, balance.date);
    setIncomeModal(false);
  };

  const createExpence = () => {
    addExpence(
      expenceState.price,
      expenceState.category,
      expenceState.date,
      expenceState.goalID
    );
    setExpenseModal(false);
  };

  const createGoals = () => {
    addGoal(goalState.price, goalState.name);
    setGoalModal(false);
  };
const dailyExpenses = WEEK_DAYS.map((dayName, idx) => {
  const total = expences.reduce((sum, e) => {
    if (!e.date) return sum;

    try {
      // "dd.MM.yyyy, HH:mm:ss" formatini parse qilish
      const [datePart, timePart] = e.date.split(", ");
      const [day, month, year] = datePart.split(".").map(Number);
      const [hours, minutes, seconds] = timePart.split(":").map(Number);

      const jsDate = new Date(year, month - 1, day, hours, minutes, seconds);

      // WEEK_DAYS Sunday = 0, Monday = 1 ... bo‘lsa moslash
      const dayIndex = jsDate.getDay();

      if (dayIndex === idx) {
        return sum + e.price;
      }
    } catch (err) {
      console.warn("Invalid date format:", e.date);
      return sum; // noto‘g‘ri date ni o'tkazib yuboradi
    }

    return sum;
  }, 0);

  return { day: dayName, value: total };
});


  return (
    <section className="p-10 w-full min-h-screen bg-gray-900">
      {/* Summary Cards */}
      <div className="grid lg:grid-cols-3 gap-6 mb-16 mt-10">
        <article className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:scale-105 duration-150 ease-in">
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

        <article className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:scale-105 duration-150 ease-in">
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

        <article className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:scale-105 duration-150 ease-in">
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
          onClick={() => setIncomeModal(true)}
          className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 transition duration-200 rounded-lg px-6 py-4 text-white font-semibold shadow-md"
        >
          <Plus className="w-5 h-5" />
          Добавить доход
        </button>

        <button
          onClick={() => setExpenseModal(true)}
          className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 transition duration-200 rounded-lg px-6 py-4 text-white font-semibold shadow-md"
        >
          <Wallet className="w-5 h-5" />
          Добавить расход
        </button>

        <button
          onClick={() => setGoalModal(true)}
          className="flex items-center justify-center gap-3 bg-yellow-600 hover:bg-yellow-500 transition duration-200 rounded-lg px-6 py-4 text-white font-semibold shadow-md"
        >
          <Gift className="w-5 h-5" />
          Добавить цель
        </button>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-16">
        <div className="bg-gray-800 p-5 rounded-lg shadow-md">
          <h2 className="text-white mb-5 text-lg font-semibold">Доход</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" stroke="#fff" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  border: "none",
                  borderRadius: 8,
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar
                dataKey="income"
                shape={(props) => {
                  const { x, y, width, height, payload } = props;
                  const income = payload.income;
                  // agar income = 0 bo'lsa balandligi minimal bo'lsin
                  const displayHeight = income === 0 ? 100 : height;
                  const displayY = income === 0 ? y - 100 : y;

                  return (
                    <rect
                      x={x}
                      y={displayY}
                      width={width}
                      height={displayHeight}
                      fill={income === 0 ? "#7D8D86" : "#22c55e"}
                      rx={6}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 p-5 rounded-lg shadow-md">
          <h2 className="text-white mb-5 text-lg font-semibold">
            Распределение расходов по категориям
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={
                  expences && expences.length > 0 ? transFormedData : DUMMY_DATA
                }
                dataKey="price"
                nameKey="category"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={5}
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

      {/* Daily Heatmap */}
      <div className="bg-gray-800 p-5 rounded-lg shadow-md mb-16">
        <h2 className="text-white mb-5 text-lg font-semibold">
          Ежедневные расходы
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {dailyExpenses.map((day, idx) => {
            const intensity = Math.min(day.value / 200000, 1);
            const bgColor = `rgba(239, 68, 68, ${intensity})`;
            return (
              <div
                key={idx}
                className="p-4 text-center rounded-md text-white font-semibold"
                style={{ backgroundColor: bgColor }}
              >
                {day.day}
                <div className="text-sm mt-1">
                  {day.value.toLocaleString()} сом
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Goals Section */}
      <div className="bg-gray-800 p-5 rounded-lg shadow-md mb-16">
        <h2 className="text-white mb-5 text-lg font-semibold">Активные цели</h2>
        {goals.map((goal, idx) => {
          const percent = Math.floor((goal.balance / goal.price) * 100);
          return (
            <div key={idx} className="mb-5">
              <p className="text-white font-semibold mb-1">{goal.name}</p>
              <div className="w-full bg-gray-700 rounded-full h-6 mb-2">
                <div
                  className="bg-yellow-500 h-6 rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-white text-sm">
                {goal.balance.toLocaleString()} из {goal.price.toLocaleString()}{" "}
                сом ({percent}%)
              </p>
            </div>
          );
        })}
      </div>

      {/* History Section */}
      <div className="bg-gray-800 p-5 rounded-lg shadow-md">
        <h2 className="text-white mb-5 text-lg font-semibold">
          История транзакций
        </h2>
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
            {expences &&
              expences.map((t, idx) => (
                <tr key={idx} className="border-b border-gray-700">
                  <td className="px-4 py-2">{t.date.split(",")[0]}</td>
                  <td>{t.category}</td>
                  <td className="px-4 py-2">{t.category}</td>
                  <td className="px-4 py-2">{t.price.toLocaleString()} сом</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {incomeModal && (
        <IncomeModal
          setBalance={setBalance}
          balance={balance}
          handleBalanceCreate={handleBalanceCreate}
          setIncomeModal={setIncomeModal}
        />
      )}

      {expenseModal && (
        <ExpenceModal
          setExpenseModal={setExpenseModal}
          setExpenceState={setExpenceState}
          expenceState={expenceState}
          createExpence={createExpence}
          goals={goals}
        />
      )}
      {goalModal && (
        <GoalModal
          setGoalModal={setGoalModal}
          goalState={goalState}
          setGoalState={setGoalState}
          createGoals={createGoals}
        />
      )}
    </section>
  );
};
