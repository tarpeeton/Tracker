import { useMemo } from "react";
import {MONTHS} from '@/Constants/Dashboard'
interface BalanceHistory {
  date: string;
  price: number;
}

export function useChartData(balanceHistory: BalanceHistory[]) {
  const monthlyIncomes = useMemo(() => {
    const incomes = new Array(12).fill(0);

    if (!balanceHistory || balanceHistory.length === 0) {
      return incomes;
    }

    balanceHistory.forEach((b) => {
      if (b.date) {
        try {
          const [datePart, timePart] = b.date.split(", ");
          const [day, month, year] = datePart.split(".").map(Number);
          const [hours, minutes, seconds] = timePart.split(":").map(Number);

          const jsDate = new Date(
            year,
            month - 1,
            day,
            hours,
            minutes,
            seconds
          );
          const monthIndex = jsDate.getMonth();

          if (monthIndex >= 0 && monthIndex < 12) {
            incomes[monthIndex] += b.price;
          }
        } catch (error) {
          console.error("Date parsing error:", error);
        }
      }
    });

    return incomes;
  }, [balanceHistory]);

  const chartData = useMemo(() => {

    const currentMonthIndex = new Date().getMonth();

    return MONTHS.map((month, index) => ({
      month,
      income: monthlyIncomes[index],
      isCurrent: index === currentMonthIndex,
    }));
  }, [monthlyIncomes]);

  return chartData;
}
