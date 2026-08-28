import React from 'react';

// ==========================================
// 1. FormInput
// ==========================================
export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  helperText,
  error,
  required,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        required={required}
        className={`w-full px-3.5 py-2.5 bg-white text-gray-900 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-gray-50 disabled:text-gray-500 ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
            : 'border-gray-200 hover:border-gray-300'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};

// ==========================================
// 2. FormSelect
// ==========================================
export interface FormOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: FormOption[];
  helperText?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options = [],
  children,
  helperText,
  error,
  required,
  placeholder,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        required={required}
        className={`w-full px-3.5 py-2.5 bg-white text-gray-900 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-gray-50 disabled:text-gray-500 ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
            : 'border-gray-200 hover:border-gray-300'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.length > 0
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error ? (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};

// ==========================================
// 3. FormTextarea
// ==========================================
export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  helperText,
  error,
  required,
  rows = 3,
  className = '',
  id,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        className={`w-full px-3.5 py-2.5 bg-white text-gray-900 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-gray-50 disabled:text-gray-500 ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
            : 'border-gray-200 hover:border-gray-300'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};

// ==========================================
// 4. FormSwitch (Toggle)
// ==========================================
export interface FormSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const FormSwitch: React.FC<FormSwitchProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-start justify-between py-1">
      <div className="pr-4">
        <label className="text-sm font-medium text-gray-800 cursor-pointer">{label}</label>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

// ==========================================
// 5. FormCheckbox
// ==========================================
export interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  label,
  description,
  id,
  className = '',
  ...props
}) => {
  const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={checkboxId}
          type="checkbox"
          className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer ${className}`}
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={checkboxId} className="font-medium text-gray-700 cursor-pointer">
          {label}
        </label>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );
};
