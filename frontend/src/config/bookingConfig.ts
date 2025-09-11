// Configuration for booking system
export const BOOKING_CONFIG = {
  // Default values for missing data
  DEFAULTS: {
    ROOM_TYPE: 'Не указано',
    MEAL_PLAN: 'Не указано', 
    CHECK_IN: 'Не указано',
    CHECK_OUT: 'Не указано',
    HOTEL_NAME: 'Отель не указан',
    HOTEL_CATEGORY: 'Категория не указана',
    CITY: 'Город не указан',
    CURRENCY: 'EUR'
  },
  
  // Data extraction priority order
  EXTRACTION_PRIORITY: {
    ROOM_TYPE: [
      'tour_details.room_type',
      'tour_details.accommodation.room.name',
      'tour_details.selected_room.room.name',
      'tour_details.selected_room.name',
      'customer_data.selected_room.room.name',
      'customer_data.selected_room.name'
    ],
    MEAL_PLAN: [
      'tour_details.meal_plan',
      'tour_details.accommodation.meal.name',
      'tour_details.selected_room.meal.name',
      'tour_details.selected_room.meal_plan',
      'customer_data.selected_room.meal.name',
      'customer_data.selected_room.meal_plan'
    ],
    CHECK_IN: [
      'tour_details.check_in',
      'tour_details.accommodation.check_in',
      'tour_details.selected_room.check_in',
      'tour_details.search_result.check_in',
      'customer_data.selected_room.check_in',
      'customer_data.search_result.check_in',
      'customer_data.searchResult.check_in'
    ],
    CHECK_OUT: [
      'tour_details.check_out',
      'tour_details.accommodation.check_out',
      'tour_details.selected_room.check_out',
      'tour_details.search_result.check_out',
      'customer_data.selected_room.check_out',
      'customer_data.search_result.check_out',
      'customer_data.searchResult.check_out'
    ]
  }
} as const

// Helper function to extract data based on priority
export const extractDataByPriority = (
  data: any, 
  priorityPaths: string[], 
  defaultValue: string
): string => {
  for (const path of priorityPaths) {
    const value = getNestedValue(data, path)
    if (value && value !== 'N/A' && value !== 'null' && value !== 'undefined') {
      return value
    }
  }
  return defaultValue
}

// Helper function to get nested object value by path
const getNestedValue = (obj: any, path: string): string | null => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null
  }, obj)
}
