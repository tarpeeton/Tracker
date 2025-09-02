import { motion, AnimatePresence } from "framer-motion";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  text: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  text,
  confirmText = "Да, удалить",
  cancelText = "Отмена",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl bg-[#1a1a1a] p-6 text-center text-white shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text-[24px] font-semibold mb-3 lg:text-[25px]">{title}</h2>
            <p className="text-gray-300 text-[18px] mb-6 ">{text}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onConfirm}
                className="flex-1 rounded-[8px] bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700 transition"
              >
                {confirmText}
              </button>
              <button
                onClick={onCancel}
                className="flex-1 rounded-[8px] bg-gray-600 px-4 py-2 text-white font-medium hover:bg-gray-700 transition"
              >
                {cancelText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
