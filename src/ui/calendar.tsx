import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

// Universal type that accepts Date, string, or null
type DateValue = Date | string | null;

interface CalendarProps<T extends DateValue> {
  value: T;
  setDate: Dispatch<SetStateAction<T>>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  format?: "date" | "string" | "iso"; // Output format
}

const CustomCalendar = <T extends DateValue>({
  value,
  setDate,
  placeholder = "Выберите дату",
  className = "",
  disabled = false,
  minDate = new Date(1900, 0, 1),
  maxDate = new Date(2040, 11, 31),
  format = "string",
}: CalendarProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");

  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const monthsRus = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  const daysRus = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  // Convert any value to Date object
  const parseDate = (val: DateValue): Date | null => {
    if (!val) return null;
    if (val instanceof Date) return val;
    if (typeof val === "string") {
      const parsed = new Date(val);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  };

const formatOutput = (date: Date): T => {
  const localDateString = date.toLocaleDateString("en-CA");
  if (value === null) return null as T;
  if (typeof value === "string") return localDateString as T;

  return date as T;
};

  // Get current date as Date object
  const currentDate = parseDate(value);

  // Initialize calendar position based on current date
  useEffect(() => {
    if (currentDate) {
      setCurrentMonth(currentDate.getMonth());
      setCurrentYear(currentDate.getFullYear());
    }
  }, [value]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDisplayDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString("ru-RU");
  };

  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number): number => {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const isDateDisabled = (date: Date): boolean => {
    return date < minDate || date > maxDate;
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    if (!isDateDisabled(newDate)) {
      const formattedDate = formatOutput(newDate);
      setDate(formattedDate);
      setIsOpen(false);
    }
  };

  const handleMonthClick = (monthIndex: number) => {
    setCurrentMonth(monthIndex);
    setViewMode("days");
  };

  const handleYearClick = (year: number) => {
    setCurrentYear(year);
    setViewMode("months");
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isSelected =
        currentDate &&
        date.getDate() === currentDate.getDate() &&
        date.getMonth() === currentDate.getMonth() &&
        date.getFullYear() === currentDate.getFullYear();
      const isToday = date.toDateString() === new Date().toDateString();
      const isDisabledDate = isDateDisabled(date);

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          disabled={isDisabledDate}
          className={`
            h-8 w-8 rounded-full text-sm font-medium transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-gray-400
            ${
              isDisabledDate
                ? "text-gray-500 cursor-not-allowed opacity-40"
                : "text-white hover:bg-gray-700 cursor-pointer"
            }
            ${isSelected ? "bg-yellow-500 hover:bg-yellow-400" : "bg-black/20"}
            ${
              isToday && !isSelected && !isDisabledDate
                ? "bg-gray-600 font-bold"
                : ""
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const renderMonths = () => {
    return monthsRus.map((month, index) => (
      <button
        key={month}
        onClick={() => handleMonthClick(index)}
        className={`
          px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
          hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500
          ${
            currentMonth === index
              ? "bg-yellow-500 text-black"
              : "text-white bg-gray-800"
          }
        `}
      >
        {month}
      </button>
    ));
  };

  const renderYears = () => {
    const years = [];
    const startYear = Math.floor(currentYear / 12) * 12;

    for (let year = startYear; year < startYear + 12; year++) {
      const yearDate = new Date(year, 0, 1);
      const isDisabledYear = yearDate < minDate || yearDate > maxDate;

      if (year >= 1900 && year <= 2040) {
        years.push(
          <button
            key={year}
            onClick={() => handleYearClick(year)}
            disabled={isDisabledYear}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-gray-500
              ${
                isDisabledYear
                  ? "text-gray-500 cursor-not-allowed opacity-40"
                  : "hover:bg-gray-700 hover:text-white cursor-pointer"
              }
              ${
                currentYear === year
                  ? "bg-yellow-500 text-black"
                  : "text-white bg-gray-800"
              }
            `}
          >
            {year}
          </button>
        );
      }
    }

    return years;
  };

  const navigateYears = (direction: "prev" | "next") => {
    const change = direction === "prev" ? -12 : 12;
    const newYear = currentYear + change;
    if (newYear >= 1900 && newYear <= 2040) {
      setCurrentYear(newYear);
    }
  };

  return (
    <div className={`relative ${className}`} ref={calendarRef}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={formatDisplayDate(currentDate)}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-2.5 pr-10 bg-inherit border  rounded-lg
            focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            transition-colors duration-200
            ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:border-gray-400"
            }
          `}
        />
        <Calendar
          className={`absolute right-3 top-2.5 h-5 w-5 ${
            disabled ? "text-gray-300" : "text-gray-400"
          }`}
        />
      </div>

      {/* Calendar Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2  bg-[#2b2a2a] border border-gray-700 rounded-lg shadow-lg z-50 min-w-[300px]">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  if (viewMode === "days") navigateMonth("prev");
                  else if (viewMode === "years") navigateYears("prev");
                }}
                className="p-1 rounded-full hover:bg-gray-700 transition-colors duration-200"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>

              <div className="flex items-center space-x-2">
                {viewMode === "days" && (
                  <>
                    <button
                      onClick={() => setViewMode("months")}
                      className="px-3 py-1 rounded-lg hover:bg-gray-700 font-medium hover:text-white text-white transition-colors duration-200"
                    >
                      {monthsRus[currentMonth]}
                    </button>
                    <button
                      onClick={() => setViewMode("years")}
                      className="px-3 py-1 rounded-lg hover:bg-gray-700 hover:text-white font-medium text-white transition-colors duration-200"
                    >
                      {currentYear}
                    </button>
                  </>
                )}
                {viewMode === "months" && (
                  <button
                    onClick={() => setViewMode("years")}
                    className="px-3 py-1 rounded-lg hover:bg-gray-700 hover:text-white font-medium text-white transition-colors duration-200"
                  >
                    {currentYear}
                  </button>
                )}
                {viewMode === "years" && (
                  <span className="px-3 py-1 font-medium text-white">
                    {Math.floor(currentYear / 12) * 12} -{" "}
                    {Math.floor(currentYear / 12) * 12 + 11}
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  if (viewMode === "days") navigateMonth("next");
                  else if (viewMode === "years") navigateYears("next");
                }}
                className="p-1 rounded-full hover:bg-gray-700 transition-colors duration-200"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Calendar Content */}
            {viewMode === "days" && (
              <>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {daysRus.map((day) => (
                    <div
                      key={day}
                      className="h-8 flex items-center justify-center text-xs font-medium text-gray-400"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
              </>
            )}

            {viewMode === "months" && (
              <div className="grid grid-cols-3 gap-2">{renderMonths()}</div>
            )}

            {viewMode === "years" && (
              <div className="grid grid-cols-4 gap-2">{renderYears()}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Universal Calendar UI Kit Component
interface CalendarKitProps<T extends DateValue> {
  value: T;
  setDate: Dispatch<SetStateAction<T>>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export const MyCalendar = <T extends DateValue>({
  value,
  setDate,
  placeholder = "Нажмите для выбора даты",
  className = "",
  disabled = false,
  minDate,
  maxDate,
}: CalendarKitProps<T>) => {
  return (
    <div className="bg-inherit">
      <CustomCalendar
        value={value}
        setDate={setDate}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
      />
    </div>
  );
};
