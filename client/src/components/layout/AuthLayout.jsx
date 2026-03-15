export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen app-dots text-[color:var(--text-primary)]">
      {children}
    </div>
  );
}
