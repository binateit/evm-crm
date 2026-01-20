// src/styles/primereact/button.ts
// Button passthrough configuration with brand colors

interface ButtonProps {
  text?: boolean;
  rounded?: boolean;
  outlined?: boolean;
  severity?: "secondary" | "success" | "danger" | "warning" | "info";
  label?: string;
}

export const button = {
  root: ({ props }: { props: ButtonProps }) => ({
    className: `inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none ${
      // Text/Icon-only buttons (transparent background)
      props.text
        ? `${props.rounded ? "rounded-full w-10 h-10 p-0" : "rounded-lg px-3 py-2"} text-gray-600 hover:bg-gray-100 focus:ring-2 focus:ring-gray-300`
        : // Outlined buttons
          props.outlined
          ? `${props.rounded ? "rounded-full px-4 py-2" : "rounded-lg px-4 py-2.5"} border-2 focus:ring-2 focus:ring-offset-2 ${
              props.severity === "success"
                ? "border-[#00A870] text-[#00A870] hover:bg-[#00A870]/10 focus:ring-[#00A870]/50"
                : props.severity === "danger"
                  ? "border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/10 focus:ring-[#ef4444]/50"
                  : props.severity === "warning"
                    ? "border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b]/10 focus:ring-[#f59e0b]/50"
                    : props.severity === "info"
                      ? "border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10 focus:ring-[#3b82f6]/50"
                      : "border-[#042D57] text-[#042D57] hover:bg-[#042D57]/10 focus:ring-[#042D57]/50"
            }`
          : // Solid buttons
            `${props.rounded ? "rounded-full px-4 py-2" : "rounded-lg px-4 py-2.5"} focus:ring-2 focus:ring-offset-2 ${
              props.severity === "secondary"
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : props.severity === "success"
                  ? "bg-[#00A870] hover:bg-[#00865a] text-white focus:ring-[#00A870]/50"
                  : props.severity === "danger"
                    ? "bg-[#ef4444] hover:bg-[#dc2626] text-white focus:ring-[#ef4444]/50"
                    : props.severity === "warning"
                      ? "bg-[#f59e0b] hover:bg-[#d97706] text-white focus:ring-[#f59e0b]/50"
                      : props.severity === "info"
                        ? "bg-[#3b82f6] hover:bg-[#2563eb] text-white focus:ring-[#3b82f6]/50"
                        : "bg-[#042D57] hover:bg-[#0f7daf] text-white focus:ring-[#042D57]/50"
            }`
    }`,
  }),
  label: ({ props }: { props: ButtonProps }) => ({
    className: props.label ? "font-medium" : "hidden",
  }),
  icon: {
    className: "w-5 h-5 shrink-0",
  },
};
