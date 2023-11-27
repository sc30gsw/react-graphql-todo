import React from 'react'
import {
  Control,
  FieldValues,
  UseControllerProps,
  useController,
} from 'react-hook-form'

type InputProps = {
  id: string
  placeholder: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  type?: string
  disabled?: boolean
  required?: boolean
  autoFocus?: boolean
}

type ExtendInputProps<T extends FieldValues> = UseControllerProps<T> &
  InputProps

const Input = <T extends FieldValues>({
  name,
  placeholder,
  type,
  control,
  disabled,
  required,
  rules,
  autoFocus,
}: ExtendInputProps<T>) => {
  const { field, fieldState } = useController<T>({ name, control, rules })
  const { error } = fieldState

  return (
    <>
      <input
        {...field}
        type={type}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`px-4 py-2 border w-[45%] focus:outline-none rounded-md mt-3 shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed ${
          error ? 'border-red-500' : 'border-neutral-300'
        } ${error ? 'focus:border-red-500' : 'focus:border-black'}`}
        autoFocus={autoFocus}
      />
      {error && <span className="text-red-500">{error.message}</span>}
    </>
  )
}

export default Input
