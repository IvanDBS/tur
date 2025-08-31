import { ref } from 'vue'

// Опции для Multiselect
export const useSearchData = () => {
  const nightsOptions = ref([
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6' },
    { value: 7, label: '7' },
    { value: 8, label: '8' },
    { value: 9, label: '9' },
    { value: 10, label: '10' },
    { value: 11, label: '11' },
    { value: 12, label: '12' },
    { value: 13, label: '13' },
    { value: 14, label: '14' },
    { value: 15, label: '15' },
    { value: 16, label: '16' },
    { value: 17, label: '17' },
    { value: 18, label: '18' },
    { value: 19, label: '19' },
    { value: 20, label: '20' },
    { value: 21, label: '21' },
    { value: 22, label: '22' },
    { value: 23, label: '23' },
    { value: 24, label: '24' },
    { value: 25, label: '25' },
    { value: 26, label: '26' },
    { value: 27, label: '27' },
    { value: 28, label: '28' },
    { value: 29, label: '29' },
    { value: 30, label: '30' },
  ])

  const adultsOptions = ref([
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6' },
    { value: 7, label: '7' },
    { value: 8, label: '8' },
    { value: 9, label: '9' },
    { value: 10, label: '10' },
  ])

  const childrenOptions = ref([
    { value: 0, label: 'Без детей' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
  ])

  // Опции для выбора возраста детей (от 0 до 17 лет)
  const childrenAgeOptions = ref(
    Array.from({ length: 18 }, (_, i) => ({ value: i, label: i.toString() }))
  )

  const departureCities = ref([
    { id: 1, name: 'CHISINAU' },
    { id: 2, name: 'BUCHAREST' },
    { id: 3, name: 'ODESSA' },
  ])

  const countries = ref([
    { id: 1, name: 'TÜRKIYE' },
    { id: 2, name: 'EGYPT' },
    { id: 3, name: 'GREECE' },
    { id: 4, name: 'BULGARIA' },
    { id: 5, name: 'SPAIN' },
  ])

  const packages = ref([
    { id: 1, name: 'ANTALYA FULL' },
    { id: 2, name: 'ANTALYA HOTEL ONLY' },
    { id: 3, name: 'KEMER FULL' },
  ])

  const arrivalCities = ref([
    { id: 1, name: 'ANTALYA' },
    { id: 2, name: 'ISTANBUL' },
    { id: 3, name: 'BODRUM' },
  ])

  const regions = ref([
    { id: 1, name: 'Любой' },
    { id: 2, name: 'ALANYA' },
    { id: 3, name: 'ANTALYA' },
    { id: 4, name: 'BELEK' },
    { id: 5, name: 'FETHIYE' },
    { id: 6, name: 'KEMER' },
    { id: 7, name: 'SIDE' },
  ])

  const categories = ref([
    { id: 1, name: 'Любая' },
    { id: 2, name: 'Special' },
    { id: 3, name: '2⭐' },
    { id: 4, name: '3⭐' },
    { id: 5, name: '4⭐' },
    { id: 6, name: '5⭐' },
    { id: 7, name: 'BOUTIQUE' },
  ])

  // Список отелей
  const hotels = ref([
    { id: 1, name: 'ALBATROS AQUA BLU RESORT SHARM EL SHEKH' },
    { id: 2, name: 'ALBATROS AQUA PARK' },
    { id: 3, name: 'ALBATROS LAGUNA VISTA BEACH' },
    { id: 4, name: 'ALBATROS PALACE' },
    { id: 5, name: 'ALBATROS ROYAL GRAND SHARM RESORT (ADULT ONLY)' },
    {
      id: 6,
      name: 'ALBATROS SHARM RESORT (EX.BEACH ALBATROS SHARM EL SHEIKH)',
    },
  ])

  const meals = ref([
    { id: 1, name: 'Любое' },
    { id: 2, name: 'AI и лучше' },
    { id: 3, name: 'BB' },
    { id: 4, name: 'FB' },
    { id: 5, name: 'HB' },
    { id: 6, name: 'RO' },
  ])

  const options = ref([
    { id: 1, name: 'Выбрать все' },
    { id: 2, name: 'Есть места на рейсе' },
    { id: 3, name: 'Бизнесс класс $' },
    { id: 4, name: 'Доступные туры' },
    { id: 5, name: 'Ночной рейс' },
    { id: 6, name: 'Дневной рейс' },
  ])

  return {
    nightsOptions,
    adultsOptions,
    childrenOptions,
    childrenAgeOptions,
    departureCities,
    countries,
    packages,
    arrivalCities,
    regions,
    categories,
    hotels,
    meals,
    options,
  }
}
