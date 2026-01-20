// src/styles/primereact/dialog.ts
// Dialog passthrough configuration with proper overlay and positioning

export const dialog = {
  root: {
    className: "rounded-xl shadow-2xl border border-gray-200",
  },
  mask: {
    className: "bg-black/50 backdrop-blur-sm",
  },
  header: {
    className: "px-6 py-5 bg-white border-b border-gray-200 rounded-t-xl",
  },
  content: {
    className: "px-6 py-4 bg-white",
  },
  footer: {
    className: "px-6 py-4 bg-white border-t border-gray-200 rounded-b-xl",
  },
  closeButton: {
    className:
      "w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors",
  },
  closeButtonIcon: {
    className: "w-4 h-4",
  },
};
