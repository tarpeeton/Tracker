import { Dispatch, SetStateAction, useCallback, useState } from "react";
import Select from "react-select";
import { X } from "lucide-react";
import { DashboardStore, IGoals } from "@/store/Dashboard";

interface IexpenceModal {
  setExpenseModal: Dispatch<SetStateAction<boolean>>;
  goals: IGoals[];
}

export const ExpenceModal = ({ setExpenseModal, goals }: IexpenceModal) => {
  const { addExpence } = DashboardStore();
  const [expenceState, setExpenceState] = useState({
    price: 0,
    category: "",
    goalID: "",
    date: "",
  });

  const createExpence = useCallback(() => {
    addExpence(
      expenceState.price,
      expenceState.category,
      expenceState.date,
      expenceState.goalID
    );
    setExpenseModal(false);
    setExpenceState({ price: 0, category: "", goalID: "", date: "" });
  }, [expenceState, addExpence, setExpenseModal]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96 relative shadow-lg">
        <button
          className="absolute top-3 right-3 text-white"
          onClick={() => setExpenseModal(false)}
        >
          <X />
        </button>
        <h2 className="text-white text-xl mb-4 font-semibold">
          Добавить расход
        </h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={expenceState.price === 0 ? "" : expenceState.price}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) {
                setExpenceState((prev) => ({
                  ...prev,
                  price: val === "" ? 0 : Number(val),
                }));
              }
            }}
            placeholder="Сумма"
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          />

          <input
            type="text"
            value={expenceState.category}
            onChange={(e) =>
              setExpenceState({
                ...expenceState,
                category: e.target.value,
              })
            }
            placeholder="Категория"
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          />

          <Select
            options={goals.map((g) => ({ value: g.id, label: g.name }))}
            onChange={(selected) =>
              setExpenceState({
                ...expenceState,
                goalID: selected ? selected.value : "",
              })
            }
            classNamePrefix="custom-select"
          />

          <input
            type="date"
            value={expenceState.date}
            onChange={(e) =>
              setExpenceState({
                ...expenceState,
                date: e.target.value,
              })
            }
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          />

          <button
            onClick={createExpence}
            className="bg-red-500 hover:bg-red-400 text-white p-2 rounded font-semibold"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};
