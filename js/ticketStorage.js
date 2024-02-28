// ticketStorage.js
function getSavedTickets() {
    const savedTicketsJSON = localStorage.getItem('selectedTickets');
    return JSON.parse(savedTicketsJSON) || [];
}

function saveTicketToLocalStorage(ticketInfo) {
    const savedTickets = getSavedTickets();
    savedTickets.push(ticketInfo);
    localStorage.setItem('selectedTickets', JSON.stringify(savedTickets));
}

function removeTicketFromLocalStorage(ticketInfo) {
    const savedTickets = getSavedTickets();
    const updatedTickets = savedTickets.filter(ticket => (
        ticket.row !== ticketInfo.row ||
        ticket.place !== ticketInfo.place ||
        ticket.price !== ticketInfo.price
    ));
    localStorage.setItem('selectedTickets', JSON.stringify(updatedTickets));
}