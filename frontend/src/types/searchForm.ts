import type { SearchForm, SelectedFilters } from './search'

// Типы для компонентов формы поиска
export interface SearchFormActionsProps {
  hasResults: boolean
  totalResults: number
  isLoading?: boolean
}

export interface SearchFormLoadingProps {
  message?: string
}

export interface SearchFormFieldsProps {
  searchForm: SearchForm
  selectedFilters: SelectedFilters
  activeSelector: string | null
  isLoading: boolean
  searchData: any // TODO: типизировать searchData
  filteredNights2Options: Array<{ value: number; label: string }>
  dynamicNightsOptions: Array<{ value: number; label: string }>
  calendarHints: any // TODO: типизировать calendarHints
}

// События для компонентов
export interface SearchFormActionsEmits {
  search: []
  reset: []
}

export interface SearchFormFieldsEmits {
  'update:searchForm': [value: SearchForm]
  'update:selectedFilters': [value: SelectedFilters]
  'update-nights2-min': []
}

// Типы для отдельных полей формы
export interface SearchFormFieldProps {
  modelValue: any
  options: Array<{ value: any; label: string }>
  activeSelector?: string | null
  disabled?: boolean
  placeholder?: string
  label?: string
  fieldKey?: string
}

export interface SearchFormFieldEmits {
  'update:modelValue': [value: any]
}

// Типы для строк формы
export interface SearchFormRowProps {
  searchForm: SearchForm
  activeSelector: string | null
  isLoading: boolean
  searchData: any
  filteredNights2Options: Array<{ value: number; label: string }>
}

export interface SearchFormRowEmits {
  'update:searchForm': [value: SearchForm]
  'update-nights2-min': []
}
