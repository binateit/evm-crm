// src/lib/primereact/components/calendar.ts
// Comprehensive Calendar passthrough configuration

export const calendar = {
  root: {
    className: "inline-flex w-full",
  },
  input: {
    className:
      "flex-1 h-11 text-sm py-2 px-3 text-gray-900 border border-gray-300 rounded-l-xl outline-none bg-white transition-colors hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary",
  },
  dropdownButton: {
    root: {
      className:
        "h-11 w-11 flex items-center justify-center bg-[#042D57] text-white border border-[#042D57] rounded-r-xl hover:bg-[#053a6f] transition-colors",
    },
  },
  panel: {
    className: "!bg-white border border-gray-200 rounded-xl shadow-xl z-[1100] p-3",
  },
  header: {
    className: "flex items-center justify-between p-2 border-b border-gray-100 mb-2",
  },
  title: {
    className: "flex items-center gap-2",
  },
  monthTitle: {
    className: "text-sm font-semibold text-gray-900 hover:text-primary cursor-pointer",
  },
  yearTitle: {
    className: "text-sm font-semibold text-gray-900 hover:text-primary cursor-pointer",
  },
  previousButton: {
    className:
      "w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors",
  },
  nextButton: {
    className:
      "w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors",
  },
  table: {
    className: "w-full border-collapse",
  },
  tableHeader: {
    className: "",
  },
  tableHeaderRow: {
    className: "",
  },
  weekHeader: {
    className: "p-2",
  },
  weekNumber: {
    className: "text-xs text-gray-400 font-medium",
  },
  weekDay: {
    className: "p-2 text-xs font-semibold text-gray-500 uppercase",
  },
  tableBody: {
    className: "",
  },
  tableBodyRow: {
    className: "",
  },
  day: {
    className: "p-0.5",
  },
  dayLabel: {
    className:
      "w-9 h-9 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors hover:bg-gray-100 data-[p-disabled=true]:text-gray-300 data-[p-disabled=true]:cursor-default data-[p-disabled=true]:hover:bg-transparent aria-selected:bg-[#042D57] aria-selected:text-white aria-selected:hover:bg-[#053a6f]",
  },
  monthPicker: {
    className: "my-2",
  },
  month: {
    className:
      "w-1/3 inline-flex items-center justify-center p-2 text-sm rounded-lg cursor-pointer transition-colors hover:bg-gray-100 data-[p-highlight=true]:bg-[#042D57] data-[p-highlight=true]:text-white",
  },
  yearPicker: {
    className: "my-2",
  },
  year: {
    className:
      "w-1/2 inline-flex items-center justify-center p-2 text-sm rounded-lg cursor-pointer transition-colors hover:bg-gray-100 data-[p-highlight=true]:bg-[#042D57] data-[p-highlight=true]:text-white",
  },
  timePicker: {
    className: "border-t border-gray-100 pt-3 mt-3",
  },
  hourPicker: {
    className: "flex flex-col items-center",
  },
  minutePicker: {
    className: "flex flex-col items-center",
  },
  secondPicker: {
    className: "flex flex-col items-center",
  },
  ampmPicker: {
    className: "flex flex-col items-center",
  },
  incrementButton: {
    className:
      "w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors",
  },
  decrementButton: {
    className:
      "w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors",
  },
  separator: {
    className: "px-1 text-gray-400",
  },
  buttonbar: {
    className: "flex justify-end gap-2 border-t border-gray-100 pt-3 mt-3",
  },
  todayButton: {
    root: {
      className:
        "px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors",
    },
  },
  clearButton: {
    root: {
      className:
        "px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors",
    },
  },
};
