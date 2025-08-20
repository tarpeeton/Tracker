import { Dispatch, SetStateAction } from "react";
import {X} from 'lucide-react'




interface Balance {
  price: number;
  date: string;
}

interface IncomeModal {
  setIncomeModal: Dispatch<SetStateAction<boolean>>;
  setBalance: Dispatch<SetStateAction<Balance>>;
  balance: Balance;
  handleBalanceCreate: () => void;
}

export const IncomeModal = ({
  setIncomeModal,
  setBalance,
  balance,
  handleBalanceCreate,
}: IncomeModal) => {




  return (
    <div className="fixed inset-0 bg-black/80  flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96 relative shadow-lg">
        <button
          className="absolute top-3 right-3 text-white"
          onClick={() => setIncomeModal(false)}
        >
          <X />
        </button>
        <h2 className="text-white text-xl mb-4 font-semibold">
          Добавить доход
        </h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Сумма"
            value={balance.price}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) {
                setBalance({ ...balance, price: val === "" ? 0 : Number(val) });
              }
            }}
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          />

          <input
            type="date"
            value={balance.date}
            onChange={(e) => setBalance({ ...balance, date: e.target.value })}
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          />
          <button
            type="button"
            onClick={handleBalanceCreate}
            role="button"
            className="bg-green-500 hover:bg-green-400 text-white p-2 rounded font-semibold"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};
