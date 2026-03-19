export default function Button({ children, onClick, variant = 'primary', className = '', ...props }) {
  const baseClass = 'px-4 py-2 rounded font-semibold transition';
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-300 text-gray-800 hover:bg-gray-400',
    danger: 'bg-red-500 text-white hover:bg-red-600', 
  };
  return (
    <button
      className={`${baseClass} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}