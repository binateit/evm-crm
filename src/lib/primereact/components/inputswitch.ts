// src/styles/primereact/inputswitch.ts
// InputSwitch (toggle) passthrough configuration

interface InputSwitchProps {
  checked?: boolean;
}

export const inputswitch = {
  root: ({ props }: { props: InputSwitchProps }) => ({
    className: `relative inline-block w-11 h-6 rounded-full transition-colors duration-200 peer-focus:ring-2 peer-focus:ring-[#0f7daf] peer-focus:ring-offset-2 ${
      props.checked ? "bg-[#042D57]" : "bg-gray-300"
    }`,
  }),
  input: {
    className:
      "peer appearance-none absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 rounded-full",
  },
  slider: ({ props }: { props: InputSwitchProps }) => ({
    className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-md pointer-events-none ${
      props.checked ? "translate-x-5" : "translate-x-0"
    }`,
  }),
};
