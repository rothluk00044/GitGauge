export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      {...props}
    />
  );
}