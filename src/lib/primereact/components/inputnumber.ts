// src/styles/primereact/inputnumber.ts
// InputNumber passthrough configuration

interface InputNumberContext {
  props: {
    showButtons?: boolean;
    buttonLayout?: "stacked" | "horizontal" | "vertical";
    disabled?: boolean;
  };
}

export const inputnumber = {
  root: ({ props }: InputNumberContext) => ({
    className: `inline-flex ${props.buttonLayout === "horizontal" ? "flex-row" : "flex-col"}`,
  }),
  input: {
    root: ({ props }: InputNumberContext) => ({
      className: `text-sm border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f7daf] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        props.buttonLayout === "horizontal"
          ? "border-x-0 text-center py-2 px-2"
          : "w-full px-4 py-2.5 rounded-lg"
      }`,
    }),
  },
  buttonGroup: ({ props }: InputNumberContext) => ({
    className: props.buttonLayout === "horizontal" ? "flex flex-row" : "flex flex-col",
  }),
  incrementButton: {
    root: ({ props }: InputNumberContext) => ({
      className: `flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        props.buttonLayout === "horizontal"
          ? "px-3 py-2 rounded-r-lg border-l-0"
          : "rounded-tr-lg border-l-0"
      }`,
    }),
    icon: {
      className: "w-3 h-3",
    },
  },
  decrementButton: {
    root: ({ props }: InputNumberContext) => ({
      className: `flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        props.buttonLayout === "horizontal"
          ? "px-3 py-2 rounded-l-lg border-r-0"
          : "rounded-br-lg border-l-0 border-t-0"
      }`,
    }),
    icon: {
      className: "w-3 h-3",
    },
  },
};
