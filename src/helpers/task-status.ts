  export const statusConfig = {
    todo: { label: "To Do", color: "bg-gray-500", dotColor: "bg-gray-400" },
    in_progress: {
      label: "In Progress",
      color: "bg-blue-500",
      dotColor: "bg-blue-400",
    },
    done: { label: "Done", color: "bg-green-500", dotColor: "bg-green-400" },
    blocked: { label: "Blocked", color: "bg-red-500", dotColor: "bg-red-400" },
  };

  export const filterOptions = [
    { value: "all", label: "All Tasks" },
    ...Object.entries(statusConfig).map(([key, config]) => ({
      value: key,
      label: config.label,
      color: config.dotColor,
    })),
  ];

  export const statusOptions = Object.entries(statusConfig).map(([key, config]) => ({
    value: key,
    label: config.label,
    color: config.dotColor,
  }));
