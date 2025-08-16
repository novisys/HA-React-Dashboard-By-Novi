// Button.tsx corrigé avec types TypeScript

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

function Button({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  icon,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'btn';

  const variantClasses: Record<ButtonProps['variant'] & string, string> = {
    primary: 'btn--primary',
    secondary: 'btn--secondary',
    ghost: 'btn--ghost',
    danger: 'btn--danger',
  };

  const sizeClasses: Record<ButtonProps['size'] & string, string> = {
    small: 'btn--sm',
    medium: 'btn--md',
    large: 'btn--lg',
  };

  const classes = [baseClasses, variantClasses[variant], sizeClasses[size], disabled ? 'btn--disabled' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} onClick={onClick} disabled={disabled} {...props}>
      {icon && <span className='btn-icon'>{icon}</span>}
      {children}
    </button>
  );
}

export default Button;
