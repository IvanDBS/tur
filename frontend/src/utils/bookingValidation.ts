// Утилиты для валидации данных бронирования
import type { TouristData } from '../types/booking'

export interface ValidationError {
  field: string
  message: string
}

export interface TouristValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Функция для расчета возраста
export const calculateAge = (birthDate: Date, checkInDate?: Date): number => {
  // Используем дату заселения, если указана, иначе текущую дату
  const referenceDate = checkInDate || new Date()
  
  let age = referenceDate.getFullYear() - birthDate.getFullYear()
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

// Валидация имени или фамилии
export const validateName = (name: string, fieldName: string): ValidationError | null => {
  if (!name.trim()) {
    return { field: fieldName, message: `${fieldName} обязательно для заполнения` }
  }
  
  if (!/^[A-ZА-Я\s\-]+$/.test(name)) {
    return { field: fieldName, message: `${fieldName} может содержать только буквы, пробелы и дефисы` }
  }
  
  if (name !== name.toUpperCase()) {
    return { field: fieldName, message: `${fieldName} должно быть в верхнем регистре` }
  }
  
  return null
}

// Валидация даты рождения
export const validateBirthDate = (
  birthDate: string, 
  touristTitle: string,
  searchChildrenAges?: number[],
  checkInDate?: Date
): ValidationError | null => {
  if (!birthDate) {
    return { field: 'birthDate', message: 'Дата рождения обязательна для заполнения' }
  }
  
  const date = new Date(birthDate)
  const today = new Date()
  
  if (isNaN(date.getTime())) {
    return { field: 'birthDate', message: 'Неверный формат даты рождения' }
  }
  
  if (date > today) {
    return { field: 'birthDate', message: 'Дата рождения не может быть из будущего' }
  }
  
  const age = calculateAge(date, checkInDate)
  
  if (age < 0) {
    return { field: 'birthDate', message: 'Возраст не может быть отрицательным' }
  }
  
  if (age > 120) {
    return { field: 'birthDate', message: 'Возраст не может быть больше 120 лет' }
  }
  
  // Валидация соответствия возраста и типа туриста
  if (touristTitle === 'CHD' && age >= 18) {
    return { field: 'birthDate', message: 'Ребенок не может быть старше 17 лет' }
  }
  
  if (touristTitle !== 'CHD' && age < 18) {
    return { field: 'birthDate', message: 'Взрослый не может быть младше 18 лет' }
  }
  
  // Валидация соответствия возраста в поиске
  if (touristTitle === 'CHD' && searchChildrenAges && searchChildrenAges.length > 0) {
    if (!searchChildrenAges.includes(age)) {
      return { 
        field: 'birthDate', 
        message: `Возраст ребенка (${age} лет) не соответствует возрасту в поиске (${searchChildrenAges.join(', ')} лет)` 
      }
    }
  }
  
  return null
}

// Валидация номера паспорта
export const validatePassportNumber = (passportNumber: string): ValidationError | null => {
  if (!passportNumber.trim()) {
    return { field: 'passportNumber', message: 'Номер паспорта обязателен для заполнения' }
  }
  
  if (!/^[A-Z0-9]+$/.test(passportNumber)) {
    return { field: 'passportNumber', message: 'Номер паспорта может содержать только буквы и цифры' }
  }
  
  if (passportNumber !== passportNumber.toUpperCase()) {
    return { field: 'passportNumber', message: 'Номер паспорта должен быть в верхнем регистре' }
  }
  
  return null
}

// Валидация срока действия паспорта
export const validatePassportExpiry = (passportExpiry: string): ValidationError | null => {
  if (!passportExpiry) {
    return { field: 'passportExpiry', message: 'Срок действия паспорта обязателен для заполнения' }
  }
  
  const expiryDate = new Date(passportExpiry)
  const today = new Date()
  
  if (isNaN(expiryDate.getTime())) {
    return { field: 'passportExpiry', message: 'Неверный формат даты истечения паспорта' }
  }
  
  if (expiryDate <= today) {
    return { field: 'passportExpiry', message: 'Паспорт должен быть действительным' }
  }
  
  // Проверка на разумный срок действия (не более 10 лет)
  const maxExpiryDate = new Date()
  maxExpiryDate.setFullYear(maxExpiryDate.getFullYear() + 10)
  if (expiryDate > maxExpiryDate) {
    return { field: 'passportExpiry', message: 'Срок действия паспорта не может быть более 10 лет' }
  }
  
  return null
}

// Валидация гражданства
export const validateNationality = (nationality: string): ValidationError | null => {
  if (!nationality) {
    return { field: 'nationality', message: 'Гражданство обязательно для заполнения' }
  }
  
  const validNationalities = ['MOLDOVA', 'ROMANIA', 'UKRAINE', 'RUSSIA', 'BELARUS', 'OTHER']
  if (!validNationalities.includes(nationality)) {
    return { field: 'nationality', message: 'Неверное гражданство' }
  }
  
  return null
}

// Валидация налогового кода (необязательное поле)
export const validateFiscalCode = (fiscalCode: string): ValidationError | null => {
  // Поле необязательное, если пустое - валидация проходит
  if (!fiscalCode || !fiscalCode.trim()) {
    return null
  }
  
  const trimmedCode = fiscalCode.trim()
  
  // Проверяем длину (обычно 13-16 символов)
  if (trimmedCode.length < 8 || trimmedCode.length > 20) {
    return { field: 'fiscalCode', message: 'Налоговый код должен содержать от 8 до 20 символов' }
  }
  
  // Проверяем, что содержит только буквы, цифры и дефисы
  if (!/^[A-Z0-9\-]+$/.test(trimmedCode)) {
    return { field: 'fiscalCode', message: 'Налоговый код может содержать только буквы, цифры и дефисы' }
  }
  
  return null
}

// Полная валидация туриста
export const validateTourist = (
  tourist: TouristData, 
  index: number,
  searchChildrenAges?: number[],
  checkInDate?: Date
): TouristValidationResult => {
  const errors: ValidationError[] = []
  
  // Валидация имени
  const firstNameError = validateName(tourist.firstName, 'Имя')
  if (firstNameError) {
    errors.push({ ...firstNameError, message: `Турист ${index + 1}: ${firstNameError.message}` })
  }
  
  // Валидация фамилии
  const lastNameError = validateName(tourist.lastName, 'Фамилия')
  if (lastNameError) {
    errors.push({ ...lastNameError, message: `Турист ${index + 1}: ${lastNameError.message}` })
  }
  
  // Валидация даты рождения
  const birthDateError = validateBirthDate(tourist.birthDate, tourist.title, searchChildrenAges, checkInDate)
  if (birthDateError) {
    errors.push({ ...birthDateError, message: `Турист ${index + 1}: ${birthDateError.message}` })
  }
  
  // Валидация номера паспорта
  const passportNumberError = validatePassportNumber(tourist.passportNumber)
  if (passportNumberError) {
    errors.push({ ...passportNumberError, message: `Турист ${index + 1}: ${passportNumberError.message}` })
  }
  
  // Валидация срока действия паспорта
  const passportExpiryError = validatePassportExpiry(tourist.passportExpiry)
  if (passportExpiryError) {
    errors.push({ ...passportExpiryError, message: `Турист ${index + 1}: ${passportExpiryError.message}` })
  }
  
  // Валидация гражданства
  const nationalityError = validateNationality(tourist.nationality)
  if (nationalityError) {
    errors.push({ ...nationalityError, message: `Турист ${index + 1}: ${nationalityError.message}` })
  }
  
  // Валидация налогового кода (необязательное поле)
  const fiscalCodeError = validateFiscalCode(tourist.fiscalCode || '')
  if (fiscalCodeError) {
    errors.push({ ...fiscalCodeError, message: `Турист ${index + 1}: ${fiscalCodeError.message}` })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Валидация всех туристов
export const validateAllTourists = (
  tourists: TouristData[],
  searchChildrenAges?: number[],
  checkInDate?: Date
): { isValid: boolean; errors: Record<string, ValidationError[]> } => {
  const allErrors: Record<string, ValidationError[]> = {}
  let isValid = true
  
  tourists.forEach((tourist, index) => {
    const result = validateTourist(tourist, index, searchChildrenAges, checkInDate)
    if (!result.isValid) {
      allErrors[tourist.id] = result.errors
      isValid = false
    }
  })
  
  return { isValid, errors: allErrors }
}

// Нормализация данных туриста (приведение к верхнему регистру)
export const normalizeTouristData = (tourist: TouristData): TouristData => {
  return {
    ...tourist,
    firstName: tourist.firstName?.toUpperCase().trim() || '',
    lastName: tourist.lastName?.toUpperCase().trim() || '',
    passportNumber: tourist.passportNumber?.toUpperCase().trim() || '',
    nationality: tourist.nationality?.trim() || '',
    fiscalCode: tourist.fiscalCode?.trim() || ''
  }
}

// Валидация дополнительных услуг
export const validateAdditionalServices = (services: any): ValidationError[] => {
  const errors: ValidationError[] = []
  
  // Валидация страховки
  if (!services.insurance || !services.insurance.type) {
    errors.push({ field: 'insurance', message: 'Необходимо выбрать тип страховки' })
  } else {
    const validInsuranceTypes = ['STANDARD', 'STANDARD_PLUS', 'NONE']
    if (!validInsuranceTypes.includes(services.insurance.type)) {
      errors.push({ field: 'insurance', message: 'Неверный тип страховки' })
    }
  }
  
  // Валидация COVID-19 страховки
  if (!services.covidInsurance || !services.covidInsurance.type) {
    errors.push({ field: 'covidInsurance', message: 'Необходимо выбрать тип COVID-19 страховки' })
  } else {
    const validCovidTypes = ['INCLUDED', 'OPT_OUT', 'COVID_19']
    if (!validCovidTypes.includes(services.covidInsurance.type)) {
      errors.push({ field: 'covidInsurance', message: 'Неверный тип COVID-19 страховки' })
    }
  }
  
  // Валидация трансфера
  if (!services.transfer || !services.transfer.type) {
    errors.push({ field: 'transfer', message: 'Необходимо выбрать тип трансфера' })
  } else {
    const validTransferTypes = ['GROUP', 'INDIVIDUAL', 'VIP']
    if (!validTransferTypes.includes(services.transfer.type)) {
      errors.push({ field: 'transfer', message: 'Неверный тип трансфера' })
    }
  }
  
  return errors
}

// Валидация заметок бронирования
export const validateBookingNotes = (notes: any): ValidationError[] => {
  const errors: ValidationError[] = []
  
  // Валидация комментария (если заполнен)
  if (notes.comment && typeof notes.comment === 'string') {
    const comment = notes.comment.trim()
    if (comment.length > 500) {
      errors.push({ field: 'comment', message: 'Комментарий не может быть длиннее 500 символов' })
    }
    
    // Проверка на недопустимые символы
    if (comment.match(/[<>]/)) {
      errors.push({ field: 'comment', message: 'Комментарий содержит недопустимые символы' })
    }
  }
  
  return errors
}
