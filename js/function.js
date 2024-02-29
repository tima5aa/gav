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
        tickets.forEach(ticket => {
            const priceText = ticket.querySelector('.book-ticket-price small').innerText;
            const price = parseInt(priceText.split(' ')[0]);
            total += price;
        });

        totalPrice.innerText = total + ' руб';
        saveTotalPriceToSessionStorage();
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
        const tickets = document.querySelectorAll('.list-group-item.GOOD, .list-group-item.SUPER.LUX');
        const ticketCount = tickets.length;
        ticketInfo.innerText = `${ticketCount} билет${ticketCount !== 1 ? 'а' : ''}, ${totalPrice.innerText}`;
    }

    document.body.addEventListener('click', function (event) {
        // Проверьте, происходит ли что-то неожиданное при клике в любую часть страницы.
        // console.log(event.target);
        const isTicketElement = event.target.classList.contains('list-group-item');
        const isRemoveButton = event.target.classList.contains('book-ticket-remove');
    
        if (!isTicketElement && !isRemoveButton) {
            // Логика, которая выполняется, если клик был вне элементов билетов или их кнопок удаления
            // Например, можно просто выйти из обработчика, ничего не делая
            return;
        }
    });

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
    
                            const deleteButton = newTicket.querySelector('.book-ticket-remove');
                            deleteButton.addEventListener('click', function (event) {
                                event.preventDefault();
                                listofTickets.removeChild(newTicket);
                                selectedSeats--;
                                const seatIndexIndex = selectedSeatIndexes.indexOf(seatIndex);
                                if (seatIndexIndex !== -1) {
                                    selectedSeatIndexes.splice(seatIndexIndex, 1);
                                }
                                updateTotalPrice();
                                updateEmptyState();
                                goodElement.classList.remove('selected');
                            });
                
                            selectedSeats++;
                            selectedSeatIndexes.push(seatIndex);
                            goodElement.classList.add('selected');
                        } else {
                            // Проверка на наличие класса selected перед отображением alert
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

                    const deleteButton = newTicket.querySelector('.book-ticket-remove');
                    deleteButton.addEventListener('click', function (event) {
                        event.preventDefault();
                        listofTickets.removeChild(newTicket);
                        selectedSeats--;
                        const seatIndexIndex = selectedSeatIndexes.indexOf(seatIndex);
                        if (seatIndexIndex !== -1) {
                            selectedSeatIndexes.splice(seatIndexIndex, 1);
                        }
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
});