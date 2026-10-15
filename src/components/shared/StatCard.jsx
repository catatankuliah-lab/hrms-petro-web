import { Card } from '../ui/card';
import { Icon } from '@iconify/react';

export default function StatCard({ icon, title, label, value, progress = 100, theme = 'primary' }) {
  // Pemetaan warna dinamis sesuai theme bawaan Tailwind template
  const themeStyles = {
    primary: { bgLight: 'bg-lightprimary', text: 'text-primary', bgSolid: 'bg-primary' },
    secondary: { bgLight: 'bg-lightsecondary', text: 'text-secondary', bgSolid: 'bg-secondary' },
    success: { bgLight: 'bg-lightsuccess', text: 'text-success', bgSolid: 'bg-success' },
    warning: { bgLight: 'bg-lightwarning', text: 'text-warning', bgSolid: 'bg-warning' },
    error: { bgLight: 'bg-lighterror', text: 'text-error', bgSolid: 'bg-error' },
    info: { bgLight: 'bg-lightinfo', text: 'text-info', bgSolid: 'bg-info' },
  };

  const currentTheme = themeStyles[theme] || themeStyles.primary;

  return (
    <Card className="bg-white dark:bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-8 border-none">
      <div className="flex items-center gap-4 mb-8">
        <div className={`bg-${theme}/10 ${currentTheme.text} p-3 rounded-md`}>
          <Icon icon={icon} width="24" height="24" />
        </div>
        <p className="text-lg card-title dark:text-white">{title}</p>
      </div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm text-gray-700 font-semibold dark:text-gray-200">{value}</p>
      </div>
      <div aria-valuemax="100" aria-valuemin="0" role="progressbar" className={`relative w-full overflow-hidden rounded-full dark:bg-white/10 h-2 ${currentTheme.bgLight}`}>
        <div className={`h-full flex-1 transition-all ${currentTheme.bgSolid}`} style={{ width: `${progress}%` }}></div>
      </div>
    </Card>
  );
}