  // сохранение билетов
  function saveTickets() {
    localStorage.setItem('tickets', JSON.stringify(selectedTickets));
  }
  
  // получение сохраненных данных
  function getSavedTickets() {
    const saved = localStorage.getItem('tickets');
    return saved ? JSON.parse(saved) : [];
  }

  // обновление интерфейса
  function updateUI() {
    updateTotalPrice();
    updateTicketInfo();
    renderTickets(); 
  }
document.addEventListener('DOMContentLoaded', function () {
    const ticketInfo = document.getElementById('aside-title-summary');
    const totalPrice = document.getElementById('booking-submit-summary');
    const listofTickets = document.getElementById('list-of-tickets-in-order');
    const emptyStateImage = document.querySelector('.empty-state-image');
    const goodElements = document.querySelectorAll('.GOOD');
    const superLuxElements = document.querySelectorAll('.SUPER.LUX');
    let selectedSeats = 0;
    const selectedSeatIndexes = [];

    function saveTotalPriceToSessionStorage() {
        sessionStorage.setItem('totalPrice', totalPrice.innerText);
    }

    window.addEventListener('beforeunload', function () {
        localStorage.removeItem('totalPrice');
    });

    function updateTotalPrice() {
        const tickets = document.querySelectorAll('.list-group-item.GOOD, .list-group-item.SUPER.LUX');
        let total = 0;
        let selectedTickets = [];

        tickets.forEach(ticket => {
            const priceText = ticket.querySelector('.book-ticket-price small').innerText;
            const price = parseInt(priceText.split(' ')[0]);
            total += price;

            const ticketInfo = {
                row: ticket.querySelector('.book-ticket-row').innerText,
                place: ticket.querySelector('.book-ticket-place span:first-child').innerText,
                price: price
            };
            selectedTickets.push(ticketInfo);
        });

        totalPrice.innerText = total + ' ₽';
        saveTotalPriceToSessionStorage();
        localStorage.setItem('selectedTickets', JSON.stringify(selectedTickets));

        updateTicketInfo();
        updateEmptyState();
    }

    function updateEmptyState() {
        const tickets = document.querySelectorAll('.list-group-item.GOOD, .list-group-item.SUPER.LUX');
        let hasSelectedSeats = false;

        tickets.forEach(ticket => {
            if (ticket.classList.contains('SUPER.LUX') && ticket.classList.contains('selected')) {
                hasSelectedSeats = true;
            }
        });

        if (selectedSeats > 0 || hasSelectedSeats) {
            emptyStateImage.style.display = 'none';
        } else {
            emptyStateImage.style.display = 'block';
        }
    }

    function updateTicketInfo() {
        const ticketCount = selectedSeats;
        ticketInfo.innerText = `${ticketCount} билет${ticketCount !== 1 ? 'а' : ''}, ${totalPrice.innerText}`;
    }

    goodElements.forEach((goodElement, index) => {
        goodElement.addEventListener('click', function () {
            if (!goodElement.classList.contains('seat-close')) {
                if (selectedSeats < 10) {
                    const rowIndex = goodElement.getAttribute('data-row-index');
                    const columnIndex = goodElement.getAttribute('data-column-index');
                    const seatIndex = `${rowIndex}-${columnIndex}`;

                    if (!selectedSeatIndexes.includes(seatIndex)) {
                        const price = goodElement.getAttribute('data-price');

                        if (!goodElement.classList.contains('selected')) {
                            const newTicket = document.createElement('li');
                            newTicket.classList.add('GOOD', 'list-group-item', 'selected');
                            newTicket.innerHTML = `
                                <div class="book-ticket">
                                    <div class="book-ticket-row">${rowIndex} ряд</div>
                                    <div class="book-ticket-place">
                                        <span>${columnIndex}</span><span > место</span>
                                    </div>
                                    <div class="book-ticket-price">
                                        <strong><small>${price} руб</small></strong>
                                    </div>
                                    <a class="book-ticket-remove" href="#" cart-ticket-remove="">
                                        <svg class="icon">
                                            <use xlink:href="#close"></use>
                                        </svg>
                                    </a>
                                </div>
                            `;

                            listofTickets.appendChild(newTicket);
                            updateTotalPrice();
                            updateTicketInfo();
                            updateEmptyState();
            
                            const ticketInfo = {
                                row: rowIndex,
                                place: columnIndex,
                                price: price
                            };

                            saveTicketToLocalStorage(ticketInfo);
                            updateUI();
                            saveTicketToLocalStorage(ticketInfo);

                            listofTickets.appendChild(newTicket);
                            updateTotalPrice();
                            updateTicketInfo();
                            updateEmptyState();
                            updateUI();
                            const deleteButton = newTicket.querySelector('.book-ticket-remove');
                            deleteButton.addEventListener('click', function (event) {
                                event.preventDefault();
                                listofTickets.removeChild(newTicket);
                                selectedSeats--;
                                const seatIndexIndex = selectedSeatIndexes.indexOf(seatIndex);
                                if (seatIndexIndex !== -1) {
                                    selectedSeatIndexes.splice(seatIndexIndex, 1);
                                }
                                saveTicketToLocalStorage(ticketInfo);
                                updateUI();

                            
                                updateTotalPrice();
                                updateEmptyState();
                                goodElement.classList.remove('selected');
                            });

                            selectedSeats++;
                            selectedSeatIndexes.push(seatIndex);
                            goodElement.classList.add('selected');
                        } else {
                            if (!goodElement.classList.contains('selected')) {
                                alert('Это место уже выбрано.');
                            }
                        }
                    } else {
                        alert('Нельзя выбрать больше 6 мест.');
                    }
                }
            }
        });
    });

    function handleLuxElementClick(superLuxElement) {
        if (selectedSeats < 10) {
            const rowIndex = superLuxElement.getAttribute('data-row-index');
            const columnIndex = superLuxElement.getAttribute('data-column-index');
            const seatIndex = `${rowIndex}-${columnIndex}`;

            if (!selectedSeatIndexes.includes(seatIndex)) {
                const price = superLuxElement.getAttribute('data-price');

                if (!superLuxElement.classList.contains('selected')) {
                    const newTicket = document.createElement('li');
                    newTicket.classList.add('SUPER', 'LUX', 'list-group-item', 'selected');
                    newTicket.innerHTML = `
                        <div class="book-ticket">
                            <div class="book-ticket-row">${rowIndex} ряд</div>
                            <div class="book-ticket-place">
                                <span>${columnIndex}</span><span > место</span>
                            </div>
                            <div class="book-ticket-price">
                                <strong><small>${price} руб</small></strong>
                            </div>
                            <a class="book-ticket-remove" href="#" cart-ticket-remove="">
                                <svg class="icon">
                                    <use xlink:href="#close"></use>
                                </svg>
                            </a>
                        </div>
                    `;

                    listofTickets.appendChild(newTicket);
                    updateTotalPrice();
                    updateEmptyState();
                    saveTicketToLocalStorage(ticketInfo);
                    updateUI();

                    const deleteButton = newTicket.querySelector('.book-ticket-remove');
                    deleteButton.addEventListener('click', function (event) {
                        event.preventDefault();
                        listofTickets.removeChild(newTicket);
                        selectedSeats--;
                        const seatIndexIndex = selectedSeatIndexes.indexOf(seatIndex);
                        if (seatIndexIndex !== -1) {
                            selectedSeatIndexes.splice(seatIndexIndex, 1);
                        }
                        saveTicketToLocalStorage(ticketInfo);
                        updateUI();
           
                        updateTotalPrice();
                        updateEmptyState();
                        superLuxElement.classList.remove('selected');
                    });

                    selectedSeats++;
                    selectedSeatIndexes.push(seatIndex);
                    superLuxElement.classList.add('selected');
                } else {
                    alert('Это место уже выбрано.');
                }
            } else {
                alert('Нельзя выбрать больше 6 мест.');
            }
        }
    }

    superLuxElements.forEach((superLuxElement, index) => {
        superLuxElement.addEventListener('click', function () {
            handleLuxElementClick(superLuxElement);
        });
    });

    const savedTotalPrice = sessionStorage.getItem('totalPrice');
    if (savedTotalPrice) {
        totalPrice.innerText = savedTotalPrice;
    }

    // Восстановление информации о выбранных билетах при загрузке страницы
    const savedSelectedSeats = localStorage.getItem('selectedSeats');
    const savedSelectedSeatIndexes = JSON.parse(localStorage.getItem('selectedSeatIndexes'));

    if (savedSelectedSeats && savedSelectedSeatIndexes) {
        selectedSeats = parseInt(savedSelectedSeats);
        selectedSeatIndexes.push(...savedSelectedSeatIndexes);

        const savedSelectedTickets = JSON.parse(localStorage.getItem('selectedTickets'));
        if (savedSelectedTickets) {
            savedSelectedTickets.forEach(ticketInfo => {
                const newTicket = document.createElement('li');
                newTicket.classList.add('list-group-item', 'selected');
                newTicket.innerHTML = `
                    <div class="book-ticket">
                        <div class="book-ticket-row">${ticketInfo.row}</div>
                        <div class="book-ticket-place">
                            <span>${ticketInfo.place}</span><span > место</span>
                        </div>
                        <div class="book-ticket-price">
                            <strong><small>${ticketInfo.price} руб</small></strong>
                        </div>
                        <a class="book-ticket-remove" href="#" cart-ticket-remove="">
                            <svg class="icon">
                                <use xlink:href="#close"></use>
                            </svg>
                        </a>
                    </div>
                `;

                listofTickets.appendChild(newTicket);
            });
        }

        
        // Обновление информации на странице
        saveTicketToLocalStorage(ticketInfo);
        updateUI();

        updateTotalPrice();
        updateTicketInfo();
        updateEmptyState();
    }
});
console.log(localStorage);
console.log(localStorage.getItem('tickets'));
