import {Dispatch , SetStateAction } from 'react';
import { X } from "lucide-react";


interface GoalItem {
  price: number,
  name: string
}



interface IGoalModal {
  setGoalModal: Dispatch<SetStateAction<boolean>>;
  goalState: GoalItem;
  setGoalState: Dispatch<SetStateAction<GoalItem>>;
  createGoals: () => void;
}




export const GoalModal = ({setGoalModal,
goalState,
setGoalState,
createGoals}:IGoalModal ) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96 relative shadow-lg">
        <button
          className="absolute top-3 right-3 text-white"
          onClick={() => setGoalModal(false)}
        >
          <X />
        </button>
        <h2 className="text-white text-xl mb-4 font-semibold">Добавить цель</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Сумма"
            value={goalState.price}
            onChange={(e) =>
              setGoalState({ ...goalState, price: Number(e.target.value) })
            }
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          />
          <input
            type="text"
            value={goalState.name}
            onChange={(e) =>
              setGoalState({ ...goalState, name: e.target.value })
            }
            placeholder="Введите название цели"
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          />

          <button
            onClick={createGoals}
            className="bg-red-500 hover:bg-red-400 text-white p-2 rounded font-semibold"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
}
