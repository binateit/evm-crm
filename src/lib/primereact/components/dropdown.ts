// src/styles/primereact/dropdown.ts
// Comprehensive Dropdown passthrough configuration

export const dropdown = {
  root: {
    className:
      "inline-flex items-center h-9 border border-gray-300 rounded-md bg-white cursor-pointer transition-colors hover:border-gray-400",
  },
  input: {
    className: "flex-1 text-sm py-2 px-3 text-gray-900 cursor-pointer outline-none bg-transparent",
  },
  trigger: {
    className: "w-9 flex items-center justify-center text-gray-600",
  },
  panel: {
    className: "!bg-white border border-gray-300 rounded-lg shadow-xl mt-1 z-[1100]",
  },
  header: {
    className: "!bg-white p-2 border-b border-gray-200",
  },
  filterContainer: {
    className: "!bg-white relative",
  },
  filterInput: {
    className:
      "!bg-white w-full h-9 px-3 text-sm border border-gray-300 rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary",
  },
  filterIcon: {
    className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400",
  },
  wrapper: {
    className: "max-h-60 overflow-auto py-1",
  },
  list: {
    className: "p-0 m-0 list-none",
  },
  item: {
    className:
      "px-4 py-1.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors data-[p-highlight=true]:bg-[#e8f2f7] data-[p-highlight=true]:text-[#042D57]",
  },
  emptyMessage: {
    className: "px-4 py-2.5 text-sm text-gray-500",
  },
  clearIcon: {
    className: "text-gray-400 hover:text-gray-600 mr-1",
  },
};
