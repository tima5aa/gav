// Страница 1

// Массив для хранения билетов 
let tickets = [];

// Функция добавления билета
function addTicket(row, seat) {

  // Добавляем объект билета
  tickets.push({
    row: row,
    seat: seat
  });

  // Сохраняем массив билетов в хранилище
  saveToStorage();

}

// Сохранение массива билетов 
function saveToStorage() {
  localStorage.setItem('tickets', JSON.stringify(tickets));
}


// Переход на другую страницу
function goToNextPage() {

  // Передаем массив билетов в параметрах url
  location.href = 'nextpage.html?tickets=' + encodeURIComponent(JSON.stringify(tickets));

}



// Страница 2

// Получаем данные из параметров 
const urlParams = new URLSearchParams(window.location.search);

// Получаем массив билетов в виде JSON
let tickets = JSON.parse(urlParams.get('tickets')); 

// Восстанавливаем билеты на основе данных
tickets.forEach(ticket => {
  addTicketToPage(ticket.row, ticket.seat); 
});