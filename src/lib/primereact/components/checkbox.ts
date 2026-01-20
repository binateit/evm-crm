// src/styles/primereact/checkbox.ts
// Checkbox passthrough configuration

interface CheckboxProps {
  checked?: boolean;
}

export const checkbox = {
  root: {
    className: "relative inline-flex items-center cursor-pointer",
  },
  input: {
    className: "peer appearance-none absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10",
  },
  box: ({ props }: { props: CheckboxProps }) => ({
    className: `w-5 h-5 flex items-center justify-center border-2 rounded transition-colors peer-focus:ring-2 peer-focus:ring-[#0f7daf] peer-focus:ring-offset-2 ${
      props.checked
        ? "bg-[#042D57] border-[#042D57]"
        : "border-gray-300 bg-white hover:border-gray-400"
    }`,
  }),
  icon: {
    className: "w-3 h-3 text-white pointer-events-none",
  },
};
