import React from 'react';
import { Control, Controller, RegisterOptions, FieldValues, Path } from 'react-hook-form';
import StackedInput, { StackedInputProps } from '../StackedInput';

export interface FormInputProps<T extends FieldValues> extends Omit<StackedInputProps, 'name'> {
  name: Path<T>;
  control: Control<T>;
}

const FormInput = <T extends FieldValues>({
  name,
  control,
  onChangeText,
  ...props
}: FormInputProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <StackedInput
          {...props}
          onBlur={onBlur}
          onChangeText={text => {
            onChange(text);
            onChangeText?.(text);
          }}
          value={value}
          error={error?.message}
        />
      )}
    />
  );
};

export default FormInput;
