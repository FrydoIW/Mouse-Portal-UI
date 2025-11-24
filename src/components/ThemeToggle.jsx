import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      {theme === "dark" ? "☀ Light mode" : "🌙 Dark mode"}
    </button>
  );
}

export default ThemeToggle;
