function redrawingSumAndCountInAside() {
  let tickets     = { sum: getCartTicketsSum(), count: getCartTicketQty() }
  let concessions = { sum: getCartConsSum(), count: getCartConsQty() }

  // Кількість квитків, та їх сума у верхній частині правого сайдбара
  let asideTicketHeader = document.getElementById("aside-title-summary")
  if (asideTicketHeader) asideTicketHeader.textContent = `${tickets.count} ${decletionOfWordTicket(tickets.count)}, ${tickets.sum} руб`;
     
  // Кількість консешн, та їх сума у правій частині сайдбара
  let asideBarHeader = document.getElementById("header-of-booking-detail-bar")
  if (asideBarHeader) asideBarHeader.textContent = `${concessions.count} шт, ${concessions.sum} руб`;  

  // Над кнопкою "Продовжити": 95 грн
  document.getElementById("booking-submit-summary").innerHTML = (tickets.sum + concessions.sum) + "<small> руб</small>";     
  
  // якщо data-ticket-count або data-concession-count, тоді через css ховається картинка зі сканером
  document.querySelector(".container-aside").setAttribute('data-ticket-count', tickets.count);
  document.querySelector(".container-aside").setAttribute('data-concession-count', concessions.count);

  setPoufData()
}

/**
 * Відмініювання слова квиток
 * @param {*} countTickets 
 */
function decletionOfWordTicket(countTickets){
  let word = "квитків";
  if (countTickets === 1)  word = "квиток";
  if (countTickets  >  1)  word = "квитка";
  if (countTickets  >  4)  word = "квитків";
  return word;
}