import React, { useId } from "react";

/** Shared labelled form input with an accessible label/input association. */
export interface FormFieldProps {
  label: string;
  type?: React.HTMLInputTypeAttribute;
  value: string | number;
  onChange: (value: string) => void;
  min?: string;
  step?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
  fieldClassName?: string;
  inputClassName?: string;
}

export function FormField({
  label, type = "text", value, onChange, min, step, inputMode,
  fieldClassName, inputClassName, placeholder,
}: FormFieldProps) {
  const id = useId();
  return (
    <div className={fieldClassName}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className={inputClassName}
        type={type}
        value={value}
        min={min}
        step={step}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
