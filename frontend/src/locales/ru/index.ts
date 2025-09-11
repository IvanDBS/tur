export default {
  common: {
    search: 'Поиск',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успех',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    save: 'Сохранить',
    edit: 'Редактировать',
    delete: 'Удалить',
    back: 'Назад',
    next: 'Далее',
    previous: 'Предыдущий',
    close: 'Закрыть',
    submit: 'Отправить',
    reset: 'Сбросить',
    selectLanguage: 'Выберите язык'
  },
  navigation: {
    home: 'Главная',
    search: 'Поиск',
    bookings: 'Мои туры',
    profile: 'Профиль',
    login: 'Вход',
    register: 'Регистрация',
    logout: 'Выход',
    about: 'О нас',
    contact: 'Контакты'
  },
  search: {
    title: 'Поиск туров',
    destination: 'Направление',
    departure: 'Отправление',
    arrival: 'Прибытие',
    date: 'Дата',
    duration: 'Продолжительность',
    guests: 'Гости',
    searchButton: 'Найти туры',
    noResults: 'Результаты не найдены',
    loading: 'Поиск туров...',
    from: 'Откуда',
    to: 'Куда',
    selectCity: 'Выберите город',
    selectCountry: 'Выберите страну',
    selectPackage: 'Выберите пакет',
    arrivalCityAuto: 'Город будет выбран автоматически',
    checkInFrom: 'Период заезда от',
    checkInTo: 'Период заезда до',
    nightsFrom: 'Ночей в отеле от',
    nightsTo: 'Ночей в отеле до',
    selectNights: 'Выберите количество ночей',
    adults: 'Взрослых',
    children: 'Детей',
    priceFrom: 'Цена € от',
    priceTo: 'Цена € до',
    region: 'Регион',
    category: 'Категория',
    hotels: 'Отели',
    searchHotel: 'Поиск отеля',
    meals: 'Питание',
    resetParams: 'Сбросить параметры',
    selectDate: 'Выберите дату',
    any: 'Любой'
  },
  home: {
    heroTitle: 'Бесплатный сервис бронирования туров.',
    heroSubtitle: 'migo.md - путешествуй легко, бронируй онлайн!',
    loadingData: 'Загружаем данные для поиска...',
    retry: 'Повторить'
  },
  footer: {
    description: 'Ваш надежный спутник в мире путешествий. Находим лучшие туры для незабываемого отдыха.',
    navigation: 'Навигация',
    searchTours: 'Поиск туров',
    myBookings: 'Мои бронирования',
    aboutCompany: 'О компании',
    contacts: 'Контакты',
    support: 'Поддержка',
    help: 'Помощь',
    terms: 'Условия',
    privacy: 'Конфиденциальность',
    faq: 'FAQ',
    contactUs: 'Связаться с нами',
    allRightsReserved: 'Все права защищены.'
  },
  countries: {
    'BULGARIA': 'Болгария',
    'CYPRUS': 'Кипр',
    'EGYPT': 'Египет',
    'GREECE': 'Греция',
    'MONTENEGRO': 'Черногория',
    'SPAIN': 'Испания',
    'TÜRKIYE': 'Турция',
    'UNITED ARAB EMIRATES': 'Арбаские Эмираты (ОАЭ)'
  },
  cities: {
    departure: {
      'CHISINAU': 'Кишинёв'
    },
    arrival: {
      // Турция
      'ANTALYA': 'Анталья',
      'BODRUM': 'Бодрум',
      'DALAMAN': 'Даламан',
      'ISTANBUL': 'Стамбул',
      
      // Египет
      'SHARM EL SHEIKH': 'Шарм-эль-Шейх',
      'HURGHADA': 'Хургада',
      
      // Греция
      'HERAKLION': 'Ираклион',
      
      // Испания
      'BARCELONA': 'Барселона',
      'PALMA DE MALLORCA': 'Пальма-де-Мальорка'
    }
  },
  packages: {
    // Турция
    'EGEE FULL': 'Бодрум (✈️ Перелет + 🏨 Отель) ',
    'EGEE NO AVIA': 'Бодрум (🏨 Только отель) ',
    'ANTALYA FULL': 'Анталья ( ✈️ Перелет + 🏨 Отель)  ',
    'ANTALYA NO AVIA': 'Анталья (🏨 Только отель) ',
    'ISTANBUL NO AVIA': 'Стамбул (🏨 Только отель) ',
    
    // Египет
    'SHARM-EL-SHEIKH FULL': 'Шарм-эль-Шейх (✈️ Перелет + 🏨 Отель)',
    'SHARM-EL-SHEIKH NO AVIA': 'Шарм-эль-Шейх (🏨 Только отель)',
    'HURGHADA FULL': 'Хургада (✈️ Перелет + 🏨 Отель)',
    'HURGHADA NO AVIA': 'Хургада (🏨 Только отель)',
    
    // Греция
    'CRETE FULL': 'Крит (✈️ Перелет + 🏨 Отель)',
    'GREECE NO AVIA': 'Греция (🏨 Только отель)',
    'CRETE NO AVIA': 'Крит (🏨 Только отель)',
    
    // Болгария
    'BULGARIA NO BUS': 'Болгария (🏨 Только отель)',
    
    // Кипр
    'CYPRUS FULL': 'Кипр (✈️ Перелет + 🏨 Отель)',
    'CYPRUS NO AVIA': 'Кипр (🏨 Только отель)',
    
    // Черногория
    'MONTENEGRO FULL': 'Черногория (✈️ Перелет + 🏨 Отель)',
    'MONTENEGRO NO AVIA': 'Черногория (🏨 Только отель)',
    
    // Испания
    'BARCELONA FULL': 'Барселона (✈️ Перелет + 🏨 Отель)',
    'BARCELONA NO AVIA': 'Барселона (🏨 Только отель)',
    'PALMA DE MALLORCA FULL': 'Пальма-де-Мальорка\n(✈️ Перелет + 🏨 Отель)',
    'PALMA DE MALLORCA NO AVIA': 'Пальма-де-Мальорка\n(🏨 Только отель)',
    
    // ОАЭ
    'EMIRATES NO AVIA': 'ОАЭ (🏨 Только отель)'
  }
}
