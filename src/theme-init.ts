// Theme initialization script
(function () {
  try {
    const theme = localStorage.getItem('dashboard-theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {
    // Ignore errors in theme initialization
  }
})();
