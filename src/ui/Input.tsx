"use client";

interface InputProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

export const Input = ({ value, onChange, placeholder, type }: InputProps) => {
   return (
     <input
       type={type}
       value={value}
       onChange={(e) => onChange(e.target.value)}
       placeholder={placeholder}
       className="p-2 rounded bg-gray-700 text-white border border-gray-600"
     />
   );
};
