// Re-export from config for backward compatibility
export { BOOKING_CONFIG as BOOKING_DEFAULTS, extractDataByPriority } from '../config/bookingConfig'

// Helper function to get default value or return the provided value
export const getDefaultValue = (value: string | null | undefined, defaultValue: string): string => {
  if (!value || value === 'N/A' || value === 'null' || value === 'undefined') {
    return defaultValue
  }
  return value
}
