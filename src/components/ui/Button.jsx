import React from 'react';

export function Button({ children, variant = 'primary', ...props }) {
  const base = "px-4 py-2 font-semibold rounded-lg transition focus:outline-none";
  const styles = {
    primary: `${base} bg-primary text-white hover:bg-primaryDark`,
    secondary: `${base} bg-stone text-ink hover:bg-stone-400`,
    ghost: `${base} bg-transparent text-primary hover:underline`,
    link: `${base} text-primary underline`,
  };
  return (
    <button className={styles[variant]} {...props}>
      {children}
    </button>
  );
}