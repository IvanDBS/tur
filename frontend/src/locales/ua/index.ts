export default {
  common: {
    search: 'Пошук',
    loading: 'Завантаження...',
    error: 'Помилка',
    success: 'Успіх',
    cancel: 'Скасувати',
    confirm: 'Підтвердити',
    save: 'Зберегти',
    edit: 'Редагувати',
    delete: 'Видалити',
    back: 'Назад',
    next: 'Далі',
    previous: 'Попередній',
    close: 'Закрити',
    submit: 'Відправити',
    reset: 'Скинути',
    selectLanguage: 'Оберіть мову'
  },
  navigation: {
    home: 'Головна',
    search: 'Пошук',
    bookings: 'Мої тури',
    profile: 'Профіль',
    login: 'Вхід',
    register: 'Реєстрація',
    logout: 'Вихід',
    about: 'Про нас',
    contact: 'Контакти'
  },
  search: {
    title: 'Пошук турів',
    destination: 'Напрямок',
    departure: 'Відправлення',
    arrival: 'Прибуття',
    date: 'Дата',
    duration: 'Тривалість',
    guests: 'Гості',
    searchButton: 'Знайти тури',
    noResults: 'Результати не знайдені',
    loading: 'Пошук турів...',
    from: 'Звідки',
    to: 'Куди',
    selectCity: 'Оберіть місто',
    selectCountry: 'Оберіть країну',
    selectPackage: 'Оберіть пакет',
    arrivalCityAuto: 'Місто буде обрано автоматично',
    checkInFrom: 'Період заїзду від',
    checkInTo: 'Період заїзду до',
    nightsFrom: 'Ночі в готелі від',
    nightsTo: 'Ночі в готелі до',
    selectNights: 'Оберіть кількість ночей',
    adults: 'Дорослих',
    children: 'Дітей',
    priceFrom: 'Ціна € від',
    priceTo: 'Ціна € до',
    region: 'Регіон',
    category: 'Категорія',
    hotels: 'Готелі',
    searchHotel: 'Пошук готелю',
    meals: 'Харчування',
    resetParams: 'Скинути параметри',
    selectDate: 'Оберіть дату',
    any: 'Будь-який'
  },
  home: {
    heroTitle: 'Безкоштовний сервіс бронювання турів.',
    heroSubtitle: 'migo.md - подорожуй легко, бронюй онлайн!',
    loadingData: 'Завантажуємо дані для пошуку...',
    retry: 'Повторити'
  },
  footer: {
    description: 'Ваш надійний супутник у світі подорожей. Знаходимо найкращі тури для незабутнього відпочинку.',
    navigation: 'Навігація',
    searchTours: 'Пошук турів',
    myBookings: 'Мої бронювання',
    aboutCompany: 'Про компанію',
    contacts: 'Контакти',
    support: 'Підтримка',
    help: 'Допомога',
    terms: 'Умови',
    privacy: 'Конфіденційність',
    faq: 'Часті питання',
    contactUs: 'Зв\'язатися з нами',
    allRightsReserved: 'Всі права захищені.'
  },
  countries: {
    'BULGARIA': 'Болгарія',
    'CYPRUS': 'Кіпр',
    'EGYPT': 'Єгипет',
    'GREECE': 'Греція',
    'MONTENEGRO': 'Чорногорія',
    'SPAIN': 'Іспанія',
    'TÜRKIYE': 'Туреччина',
    'UNITED ARAB EMIRATES': 'Об\'єднані Арабські Емірати (ОАЕ)'
  },
  cities: {
    departure: {
      'CHISINAU': 'Кишинів'
    },
    arrival: {
      // Турція
      'ANTALYA': 'Анталія',
      'BODRUM': 'Бодрум',
      'DALAMAN': 'Даламан',
      'ISTANBUL': 'Стамбул',
      
      // Єгипет
      'SHARM EL SHEIKH': 'Шарм-ель-Шейх',
      'HURGHADA': 'Хургада',
      
      // Греція
      'HERAKLION': 'Іракліон',
      
      // Іспанія
      'BARCELONA': 'Барселона',
      'PALMA DE MALLORCA': 'Пальма-де-Мальорка'
    }
  },
  packages: {
    // Туреччина
    'EGEE FULL': 'Бодрум (✈️ Переліт + 🏨 Готель)',
    'EGEE NO AVIA': 'Бодрум (🏨 Тільки готель)',
    'ANTALYA FULL': 'Анталія (✈️ Переліт + 🏨 Готель)',
    'ANTALYA NO AVIA': 'Анталія (🏨 Тільки готель)',
    'ISTANBUL NO AVIA': 'Стамбул (🏨 Тільки готель)',
    
    // Єгипет
    'SHARM-EL-SHEIKH FULL': 'Шарм-ель-Шейх (✈️ Переліт + 🏨 Готель)',
    'SHARM-EL-SHEIKH NO AVIA': 'Шарм-ель-Шейх (🏨 Тільки готель)',
    'HURGHADA FULL': 'Хургада (✈️ Переліт + 🏨 Готель)',
    'HURGHADA NO AVIA': 'Хургада (🏨 Тільки готель)',
    
    // Греція
    'CRETE FULL': 'Крит (✈️ Переліт + 🏨 Готель)',
    'GREECE NO AVIA': 'Греція (🏨 Тільки готель)',
    'CRETE NO AVIA': 'Крит (🏨 Тільки готель)',
    
    // Болгарія
    'BULGARIA NO BUS': 'Болгарія (🏨 Тільки готель)',
    
    // Кіпр
    'CYPRUS FULL': 'Кіпр (✈️ Переліт + 🏨 Готель)',
    'CYPRUS NO AVIA': 'Кіпр (🏨 Тільки готель)',
    
    // Чорногорія
    'MONTENEGRO FULL': 'Чорногорія (✈️ Переліт + 🏨 Готель)',
    'MONTENEGRO NO AVIA': 'Чорногорія (🏨 Тільки готель)',
    
    // Іспанія
    'BARCELONA FULL': 'Барселона (✈️ Переліт + 🏨 Готель)',
    'BARCELONA NO AVIA': 'Барселона (🏨 Тільки готель)',
    'PALMA DE MALLORCA FULL': 'Пальма-де-Мальорка\n(✈️ Переліт + 🏨 Готель)',
    'PALMA DE MALLORCA NO AVIA': 'Пальма-де-Мальорка\n(🏨 Тільки готель)',
    
    // ОАЕ
    'EMIRATES NO AVIA': 'ОАЕ (🏨 Тільки готель)'
  }
}
