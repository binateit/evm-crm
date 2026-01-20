// src/styles/primereact/paginator.ts
// Comprehensive Paginator passthrough configuration
// Using ! prefix for Tailwind important to override PrimeReact defaults

export const paginator = {
  root: {
    className:
      "!bg-white border-t border-gray-200 px-5 py-3.5 flex items-center justify-between flex-wrap gap-3 text-sm",
  },
  start: {
    className: "flex items-center gap-2",
  },
  end: {
    className: "flex items-center gap-2",
  },
  pages: {
    className: "flex items-center gap-1",
  },
  pageButton: ({ context }: { context: { active?: boolean } }) => ({
    className: `min-w-[2rem] h-8 flex items-center justify-center rounded-md text-sm transition-colors !border-0 disabled:opacity-50 disabled:cursor-not-allowed ${
      context?.active
        ? "!bg-[#042D57] !text-white hover:!bg-[#053659] font-medium"
        : "!bg-transparent !text-gray-600 hover:!bg-gray-100"
    }`,
  }),
  firstPageButton: {
    className:
      "min-w-[2rem] h-8 flex items-center justify-center rounded-md !bg-transparent !text-gray-600 hover:!bg-gray-100 !border-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  },
  prevPageButton: {
    className:
      "min-w-[2rem] h-8 flex items-center justify-center rounded-md !bg-transparent !text-gray-600 hover:!bg-gray-100 !border-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  },
  nextPageButton: {
    className:
      "min-w-[2rem] h-8 flex items-center justify-center rounded-md !bg-transparent !text-gray-600 hover:!bg-gray-100 !border-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  },
  lastPageButton: {
    className:
      "min-w-[2rem] h-8 flex items-center justify-center rounded-md !bg-transparent !text-gray-600 hover:!bg-gray-100 !border-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  },
  current: {
    className: "text-gray-700 px-2",
  },
  rowPerPageDropdown: {
    root: {
      className:
        "inline-flex items-center border border-gray-300 rounded-md bg-white h-8 ml-2 min-w-[4rem]",
    },
    input: {
      className:
        "flex-1 h-full px-3 text-sm border-0 bg-transparent text-gray-900 outline-none cursor-pointer",
    },
    trigger: {
      className:
        "w-8 h-full flex items-center justify-center text-gray-600 border-l border-gray-300",
    },
    panel: {
      className: "bg-white border border-gray-300 rounded-lg shadow-xl mt-1 z-[1100]",
    },
    wrapper: {
      className: "max-h-60 overflow-auto py-1",
    },
    list: {
      className: "p-0 m-0 list-none",
    },
    item: {
      className:
        "px-4 py-1.5 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg",
    },
  },
  jumpToPageDropdown: {
    root: {
      className: "flex items-center border border-gray-300 rounded-md bg-white h-8 ml-2",
    },
    input: {
      className: "w-16 h-8 px-2 text-sm border-0 bg-transparent text-gray-900 outline-none",
    },
  },
  jumpToPageInput: {
    className:
      "w-16 h-8 px-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 ml-2",
  },
};
