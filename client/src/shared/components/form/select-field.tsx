import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';

export interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  icon: React.FC<any>;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  disabled?: boolean;
  required: boolean;
  error?: string;
}

// ── Custom Select ──
const SelectField = ({
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
  options,
  disabled = false,
  required = false,
  error
}: SelectFieldProps) => {
  return (
    <div className='mt-4 space-y-1.5'>
      <label className='text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase'>
        <Icon size={11} />
        {label}
        {required && <span className='text-red-500'>*</span>}
      </label>
      <div className='relative'>
        <Select
          value={value}
          onValueChange={(e) => onChange(e)}
          disabled={disabled}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className='text-xs text-red-500'>{error}</p>}
    </div>
  );
};
export default SelectField;
