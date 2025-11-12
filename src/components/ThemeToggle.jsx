import useTheme from "../hooks/useTheme";

export default function ThemeToggleButton() {
  const [theme, setTheme] = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="
        inline-flex items-center justify-center
        w-10 h-10 rounded-full
        border border-[hsl(var(--border))]
        bg-[hsl(var(--card))]
        text-[hsl(var(--foreground))]
        shadow-sm hover-elevate active-elevate-2
        transition-all duration-300
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-[hsl(var(--ring))]
      "
    >
      <span className="text-lg">{theme === "dark" ? "🌞" : "🌙"}</span>
    </button>
  );
}
