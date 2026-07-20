// Fixed theme toggle button inserted outside the app fragment so it renders globally
function ThemeToggleButton({ isDark, setIsDark }: { isDark: boolean; setIsDark: (v: boolean) => void }) {
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setIsDark(!isDark)}
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-indigo-600 text-white px-4 py-3 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {isDark ? "Light" : "Dark"}
    </button>
  )
}

export{
    ThemeToggleButton
}