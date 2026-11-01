import { Input } from '@/shared/components/ui/input';
import { HTMLInputTypeAttribute } from 'react';

interface InputField {
  label: string;
  icon: React.FC<any>;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  type: HTMLInputTypeAttribute;
  prefix?: string;
}

const InputField = ({
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  prefix,
  type
}: InputField) => (
  <div className='mt-4 space-y-1.5'>
    <label className='text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase'>
      <Icon size={11} />
      {label}
      {required && <span className='text-red-500'>*</span>}
    </label>
    <div className='relative'>
      {prefix && (
        <span className='text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold select-none'>
          {prefix}
        </span>
      )}
      <Input
        type={type}
        min='0'
        step='0.01'
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-ring w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus:ring-1 focus:outline-none ${prefix ? 'pl-7' : ''} ${error ? 'border-red-400 dark:border-red-600' : 'border-input'}`}
      />
    </div>
    {error && <p className='text-xs text-red-500'>{error}</p>}
  </div>
);

export default InputField;
