// src/lib/primereact/components/password.ts
// Password passthrough configuration

export const password = {
  root: {
    className: "w-full relative",
  },
  iconField: {
    root: {
      className: "w-full",
    },
  },
  input: {
    root: {
      className:
        "w-full px-4 py-2.5 pr-10 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f7daf] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    },
  },
  showIcon: {
    className:
      "absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700",
  },
  hideIcon: {
    className:
      "absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700",
  },
};
