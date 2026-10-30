type ToastType = 'success' | 'error' | 'warning' | 'info';

const colors: Record<ToastType, string> = {
  success: '#34d399',
  error: '#fb7185',
  warning: '#fbbf24',
  info: '#60a5fa',
};

function show(content: string, type: ToastType = 'info', duration = 2200) {
  if (typeof document === 'undefined') return;
  const el = document.createElement('div');
  el.className =
    'glass-panel fixed left-1/2 top-5 z-[5000] flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-sm text-glass-text shadow-glass transition-opacity duration-200';
  const dot = document.createElement('span');
  dot.className = 'h-2 w-2 shrink-0 rounded-full';
  dot.style.background = colors[type];
  const text = document.createElement('span');
  text.textContent = content;
  el.append(dot, text);
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 220);
  }, duration);
}

export const toast = {
  success: (content: string) => show(content, 'success'),
  error: (content: string) => show(content, 'error'),
  warning: (content: string) => show(content, 'warning'),
  info: (content: string) => show(content, 'info'),
};
