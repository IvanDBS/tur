// Утилита для поиска ID по названиям в форме поиска
// Запустите это в консоли браузера на странице поиска

console.log('🔍 Поиск ID для воспроизведения запроса...');

// Функция для поиска ID по названию
function findIdByName(items, name) {
  const found = items.find(item => 
    item.name?.toLowerCase().includes(name.toLowerCase()) ||
    item.label?.toLowerCase().includes(name.toLowerCase())
  );
  return found ? { id: found.id, name: found.name || found.label } : null;
}

// Функция для поиска всех элементов с определенным текстом
function findAllByName(items, name) {
  return items.filter(item => 
    item.name?.toLowerCase().includes(name.toLowerCase()) ||
    item.label?.toLowerCase().includes(name.toLowerCase())
  ).map(item => ({ id: item.id, name: item.name || item.label }));
}

// Проверяем, есть ли доступ к данным формы
if (typeof window !== 'undefined' && window.Vue) {
  console.log('✅ Vue доступен, можно получить данные формы');
  
  // Попробуем получить данные из Vue компонента
  setTimeout(() => {
    console.log('🔍 Поиск данных формы...');
    
    // Ищем элементы с данными
    const searchElements = document.querySelectorAll('[data-testid*="search"], .search-form, .multiselect');
    console.log('Найдено элементов поиска:', searchElements.length);
    
    // Ищем селекторы с опциями
    const selectors = document.querySelectorAll('select, .multiselect-options, .dropdown-options');
    console.log('Найдено селекторов:', selectors.length);
    
  }, 1000);
} else {
  console.log('❌ Vue не доступен, используйте ручной поиск');
}

console.log(`
📋 Ручной поиск ID:

1. Откройте форму поиска в браузере
2. Откройте Developer Tools (F12)
3. В консоли выполните:

// Для поиска городов отправления
console.log('Города отправления:', window.searchData?.departureCities || 'Не найдено');

// Для поиска стран
console.log('Страны:', window.searchData?.countries || 'Не найдено');

// Для поиска пакетов
console.log('Пакеты:', window.searchData?.packages || 'Не найдено');

// Для поиска отелей
console.log('Отели:', window.searchData?.hotels || 'Не найдено');

4. Найдите нужные элементы по названиям и запишите их ID
`);

// Примеры поиска по названиям
console.log(`
🎯 Примеры поиска:

// Поиск Кишинева
const chisinau = findIdByName(departureCities, 'кишинев');
console.log('Кишинев:', chisinau);

// Поиск Турции
const turkey = findIdByName(countries, 'турция');
console.log('Турция:', turkey);

// Поиск отеля CLUB HOTEL ANJELIQUE
const hotel = findIdByName(hotels, 'CLUB HOTEL ANJELIQUE');
console.log('Отель:', hotel);
`);
