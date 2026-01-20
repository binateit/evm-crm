// src/styles/primereact/tree.ts
// Tree passthrough configuration

interface TreeContext {
  selected?: boolean;
  expanded?: boolean;
  leaf?: boolean;
  checked?: boolean;
  partialChecked?: boolean;
}

export const tree = {
  root: {
    className: "border-none bg-transparent p-0",
  },
  wrapper: {
    className: "overflow-visible",
  },
  container: {
    className: "m-0 p-0 list-none overflow-auto",
  },
  node: {
    className: "p-0 outline-none",
  },
  content: ({ context }: { context: TreeContext }) => ({
    className: [
      "flex items-center p-2 rounded-lg cursor-pointer select-none",
      "transition-all duration-200",
      "hover:bg-slate-50",
      "focus:outline-none focus:ring-2 focus:ring-[#0f7daf]/20 focus:ring-offset-1",
      context.selected ? "bg-[#0f7daf]/5" : "",
    ]
      .filter(Boolean)
      .join(" "),
  }),
  toggler: ({ context }: { context: TreeContext }) => ({
    className: [
      "cursor-pointer select-none inline-flex items-center justify-center",
      "overflow-hidden relative shrink-0 mr-2",
      "w-7 h-7 rounded-md",
      "transition-all duration-200",
      "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
      "focus:outline-none focus:ring-2 focus:ring-[#0f7daf]/20",
      context.leaf ? "invisible" : "",
    ]
      .filter(Boolean)
      .join(" "),
  }),
  togglerIcon: {
    className: "w-4 h-4 transition-transform duration-200",
  },
  nodeIcon: {
    className: "mr-2 text-slate-500",
  },
  label: {
    className: "text-sm text-gray-800",
  },
  subgroup: {
    className: "m-0 list-none pl-4 border-l border-slate-100 ml-3.5",
  },
  filterContainer: {
    className: "hidden",
  },
  loadingOverlay: {
    className: [
      "absolute inset-0 z-10 flex items-center justify-center",
      "bg-white/80 backdrop-blur-sm rounded-lg",
    ].join(" "),
  },
  loadingIcon: {
    className: "w-8 h-8 text-[#0f7daf] animate-spin",
  },
  emptyMessage: {
    className: "py-8 text-center text-gray-500 text-sm",
  },
};

// Compact tree variant - useful for dense data
export const treeCompact = {
  ...tree,
  content: ({ context }: { context: TreeContext }) => ({
    className: [
      "flex items-center py-1.5 px-2 rounded-md cursor-pointer select-none",
      "transition-all duration-150",
      "hover:bg-slate-50",
      "focus:outline-none focus:ring-2 focus:ring-[#0f7daf]/20",
      context.selected ? "bg-[#0f7daf]/5" : "",
    ]
      .filter(Boolean)
      .join(" "),
  }),
  toggler: ({ context }: { context: TreeContext }) => ({
    className: [
      "cursor-pointer select-none inline-flex items-center justify-center",
      "overflow-hidden relative shrink-0 mr-1.5",
      "w-6 h-6 rounded",
      "transition-all duration-150",
      "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
      context.leaf ? "invisible" : "",
    ]
      .filter(Boolean)
      .join(" "),
  }),
  subgroup: {
    className: "m-0 list-none pl-3 border-l border-slate-100 ml-3",
  },
};
