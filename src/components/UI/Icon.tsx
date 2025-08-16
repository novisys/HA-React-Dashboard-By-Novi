// Icon.tsx corrigé avec types TypeScript

const iconMap = {
  // Navigation
  dashboard: '📊',
  history: '📈',
  analytics: '🔍',
  home: '🏠',
  settings: '⚙️',

  // Weather
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
  partlyCloudy: '⛅',

  // Status
  online: '🟢',
  offline: '🔴',
  warning: '⚠️',

  // Actions
  edit: '✏️',
  save: '💾',
  copy: '📋',
  share: '📤',
} as const;

type IconName = keyof typeof iconMap;
type IconSize = 'small' | 'medium' | 'large' | 'xlarge';

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: IconName | string;
  size?: IconSize;
  color?: string;
  className?: string;
}

function Icon({ name, size = 'medium', color, className = '', ...props }: IconProps) {
  const sizeClasses: Record<IconSize, string> = {
    small: 'icon--sm',
    medium: 'icon--md',
    large: 'icon--lg',
    xlarge: 'icon--xl',
  };

  const classes = ['icon', sizeClasses[size], className].filter(Boolean).join(' ');

  const iconSymbol = (iconMap as Record<string, string>)[name] || name;

  return (
    <span className={classes} style={{ color }} {...props}>
      {iconSymbol}
    </span>
  );
}

export default Icon;
