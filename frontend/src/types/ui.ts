// Базовые типы для UI компонентов

export type ComponentSize = 'sm' | 'md' | 'lg'

export type ComponentVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning'

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'select'

// Базовые Props для всех UI компонентов
export interface BaseComponentProps {
  disabled?: boolean
  size?: ComponentSize
  class?: string
}

// Props для полей ввода
export interface BaseFieldProps extends BaseComponentProps {
  modelValue?: string | number | unknown
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
}

// Props для кнопок
export interface BaseButtonProps extends BaseComponentProps {
  variant?: ComponentVariant
  loading?: boolean
  fullWidth?: boolean
}

// Props для select полей
export interface SelectOption {
  value: unknown
  label: string
  disabled?: boolean
}

export interface BaseSelectProps extends BaseFieldProps {
  options: SelectOption[]
  searchable?: boolean
  canClear?: boolean
  canDeselect?: boolean
  labelProp?: string
  valueProp?: string
}

// Props для FormField (универсальное поле)
export interface FormFieldProps {
  modelValue?: string | number | unknown
  type?: InputType
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  size?: ComponentSize
  class?: string
  
  // Select-specific props
  options?: SelectOption[]
  searchable?: boolean
  canClear?: boolean
  canDeselect?: boolean
  labelProp?: string
  valueProp?: string
}

// Emits для полей ввода
export interface BaseFieldEmits {
  'update:modelValue': [value: string | number | unknown]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}

// Emits для кнопок
export interface BaseButtonEmits {
  click: [event: MouseEvent]
}
