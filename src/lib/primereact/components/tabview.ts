import type { TabViewPassThroughOptions, TabPanelPassThroughOptions } from "primereact/tabview";

// Horizontal TabView (default)
export const tabview: TabViewPassThroughOptions = {
  root: {
    className: "",
  },
  navContainer: {
    className: "relative",
  },
  navContent: {
    className: "overflow-x-auto overflow-y-hidden scroll-smooth [&::-webkit-scrollbar]:hidden",
  },
  nav: {
    className: "flex flex-1 list-none m-0 p-0 border-b border-gray-200 bg-gray-50/50",
  },
  panelContainer: {
    className: "bg-white",
  },
  inkbar: {
    className: "hidden",
  },
};

// Horizontal TabPanel (default)
export const tabpanel: TabPanelPassThroughOptions = {
  root: {
    className: "",
  },
  header: (options) => ({
    className: `mr-0 [&:last-child]:mr-0 ${
      options?.context?.selected ? "border-b-2 border-primary" : "border-b-2 border-transparent"
    }`,
  }),
  headerAction: (options) => ({
    className: `flex items-center cursor-pointer select-none no-underline relative overflow-hidden py-3 px-4 font-medium text-sm transition-colors duration-200 ${
      options?.context?.selected
        ? "text-primary bg-white"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`,
  }),
  headerTitle: {
    className: "leading-none whitespace-nowrap",
  },
  content: {
    className: "bg-white p-0",
  },
};

// Vertical TabView with separate cards
export const tabviewVertical: TabViewPassThroughOptions = {
  root: {
    className: "flex flex-row gap-5",
  },
  navContainer: {
    className:
      "relative w-52 shrink-0 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden",
  },
  navContent: {
    className: "overflow-y-auto overflow-x-hidden",
  },
  nav: {
    className: "flex flex-col list-none m-0 py-3 pr-3 min-h-full",
  },
  panelContainer: {
    className:
      "flex-1 min-w-0 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden",
  },
  inkbar: {
    className: "hidden",
  },
};

// Vertical TabPanel with separate cards
export const tabpanelVertical: TabPanelPassThroughOptions = {
  root: {
    className: "",
  },
  header: (options) => ({
    className: `mb-1 ${options?.context?.selected ? "" : ""}`,
  }),
  headerAction: (options) => ({
    className: `flex items-center w-full cursor-pointer select-none no-underline relative overflow-hidden py-2.5 pl-3 pr-3 font-medium text-sm transition-colors duration-200 rounded-r-lg border-l-[3px] ${
      options?.context?.selected
        ? "text-[#042D57] bg-[#042D57]/5 border-l-[#042D57]"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l-transparent"
    }`,
  }),
  headerTitle: {
    className: "leading-none whitespace-nowrap",
  },
  content: {
    className: "bg-white p-0",
  },
};
