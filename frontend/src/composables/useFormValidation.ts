import { reactive, computed } from 'vue'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: unknown) => string | null
  message?: string
}

export interface ValidationSchema {
  [key: string]: ValidationRule
}

export interface FormErrors {
  [key: string]: string
}

export function useFormValidation<T extends Record<string, unknown>>(
  formData: T,
  schema: ValidationSchema
) {
  const errors = reactive<FormErrors>({})

  // Валидация отдельного поля
  const validateField = (fieldName: keyof T, value: unknown): string => {
    const rule = schema[fieldName as string]
    if (!rule) return ''

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return rule.message || `${fieldName} обязателен`
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      return ''
    }

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message || `${fieldName} должен содержать минимум ${rule.minLength} символов`
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message || `${fieldName} должен содержать максимум ${rule.maxLength} символов`
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || `${fieldName} имеет неверный формат`
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value)
      if (customError) {
        return customError
      }
    }

    return ''
  }

  // Валидация всей формы
  const validateForm = (): boolean => {
    let isValid = true

    // Clear previous errors
    Object.keys(errors).forEach(key => {
      errors[key] = ''
    })

    // Validate each field
    Object.keys(schema).forEach(fieldName => {
      const value = formData[fieldName as keyof T]
      const error = validateField(fieldName as keyof T, value)
      
      if (error) {
        errors[fieldName] = error
        isValid = false
      }
    })

    return isValid
  }

  // Валидация конкретного поля
  const validateSingleField = (fieldName: keyof T) => {
    const value = formData[fieldName]
    const error = validateField(fieldName, value)
    errors[fieldName as string] = error
    return !error
  }

  // Очистка ошибок
  const clearErrors = () => {
    Object.keys(errors).forEach(key => {
      errors[key] = ''
    })
  }

  // Очистка ошибки конкретного поля
  const clearFieldError = (fieldName: keyof T) => {
    errors[fieldName as string] = ''
  }

  // Computed properties
  const hasErrors = computed(() => {
    return Object.values(errors).some(error => error !== '')
  })

  const isValid = computed(() => {
    return !hasErrors.value && Object.keys(schema).every(fieldName => {
      const value = formData[fieldName as keyof T]
      return value !== undefined && value !== null && value !== ''
    })
  })

  return {
    errors: computed(() => errors),
    hasErrors,
    isValid,
    validateForm,
    validateSingleField,
    clearErrors,
    clearFieldError
  }
}

// Предустановленные правила валидации
export const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Введите корректный email'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Пароль должен содержать минимум 6 символов'
  },
  phone: {
    pattern: /^\+?[\d\s\-\(\)]+$/,
    message: 'Введите корректный номер телефона'
  },
  required: {
    required: true
  }
}
