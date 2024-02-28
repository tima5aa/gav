// На час написання класу, Webpack не вміє компілювати статичні змінни в середині класу
let hallSeats = {}

let BOOKED = 'booked'

class CreateEvenSource {
  static listen(eventSourceUrl) {
    let that = this
    let client = new EventSource(eventSourceUrl);

    client.addEventListener('message', function (e) {
      hallSeats = JSON.parse(e.data);
      for (let i = 0; i < hallSeats.SeatLayoutData.Areas.length; i++) {
        for (let j = 0; j < hallSeats.SeatLayoutData.Areas[i].Rows.length; j++) {
          for (let k = 0; k < hallSeats.SeatLayoutData.Areas[i].Rows[j].Seats.length; k++) {
            // додати перевірку на статус 2
            let seatData = that.getSeatData(i, j, k)
            if (that.isSeatBooked({...seatData})) continue
            if (that.isSeatFreed({...seatData})) continue
            if (that.isSeatSocialDistance({...seatData})) continue
          }
        }
      }

      checkBtnNextByBookedTicketsInCart()
    })
  }

  /**
   * Місце стало "Соціальна дистанція" - не доступне для бронювання. 
   */
  static isSeatSocialDistance({cs, $seat, curStatus, newStatus}) {
    if (+newStatus === +TICKET_STATUS.SOCIAL_DISTANCE && +curStatus === +TICKET_STATUS.FREE) {
      $seat.setAttribute(TICKET_STATUS_ATTR ,             TICKET_STATUS.SOCIAL_DISTANCE);
      $seat.setAttribute(TICKET_STATUS_POUF_ATTR,         TICKET_STATUS.SOCIAL_DISTANCE);
      $seat.setAttribute(TICKET_STATUS_USER_SESSION_ATTR, TICKET_STATUS.SOCIAL_DISTANCE);
      $seat.classList.add('seat-close', 'seat-close-animation');
      setTootip($seat, TOOLTIP_SEAT_SOCIAL_MESSAGE) 
      this.markTicketInCartLocked(cs, TOOLTIP_SEAT_SOCIAL_MESSAGE.replaceAll('\n','<br>'))
      return true
    }
    return false
  }

  /**
   * Місце забронював інший клієнт
   */
  static isSeatBooked({cs, $seat, curStatus, newStatus}) {
    if (+newStatus === +TICKET_STATUS.SELECTED && +curStatus === +TICKET_STATUS.FREE) {
      $seat.setAttribute(TICKET_DATA_TIPPY_ATTR, 'Це місце вже зайняли');
      $seat.setAttribute(TICKET_STATUS_ATTR ,     TICKET_STATUS.SELECTED);
      $seat.setAttribute(TICKET_STATUS_POUF_ATTR, TICKET_STATUS.SELECTED);
      $seat.classList.add('seat-close', 'seat-close-animation');
      this.markTicketInCartLocked(cs, 'Щойно зайняли!')
      return true
    }
    return false
  }

  /**
   * На схемі залу місце звільнилось
   */
  static isSeatFreed({cs, $seat, curStatus, newStatus}) {
    if (+newStatus === +TICKET_STATUS.FREE && +curStatus === +TICKET_STATUS.SELECTED) {
      $seat.setAttribute(TICKET_STATUS_ATTR ,             TICKET_STATUS.FREE);
      $seat.setAttribute(TICKET_STATUS_POUF_ATTR,         TICKET_STATUS.FREE);
      $seat.setAttribute(TICKET_STATUS_USER_SESSION_ATTR, TICKET_STATUS.FREE);
      $seat.classList.remove('seat-close', 'seat-close-animation');
      setTootip($seat)
      this.markTicketInCartUnlocked(cs)
      return true
    }
    return false
  }

  static getSeatData(i, j, k) {
    let cs = this.getCoordinatSeat(i, j, k)
    let $seat = this.getSeatOnSchemeByAPR(cs) 
    let curStatus = $seat.getAttribute(TICKET_STATUS_ATTR );
    //newStatus в json - тип число
    let newStatus = hallSeats.SeatLayoutData.Areas[i].Rows[j].Seats[k].Status    
    return {cs, $seat, curStatus, newStatus}
  }  

  // Білет який занятий іншим, - в корзині набуває сірого кольору + ЗАЙНЯТО
  static markTicketInCartLocked(cs, text = '') {
    let ticketInCart = this.getTicketInCartByAPR(cs);
    if (ticketInCart) {
      ticketInCart.classList.add(BOOKED);
      ticketInCart.querySelector('.book-ticket-place').innerHTML += `<div class="text-secondary-booked">${text}</div>`;
      ticketInCart.querySelector('.additional-options').classList.add('hide')
    }
  }

  // Якщо місце що є в корзині стало вільним - видаляємо сірий фон та текст: ЗАЙНЯТО
  static markTicketInCartUnlocked(cs) {
    let ticketInCart = this.getTicketInCartByAPR(cs);
    if (ticketInCart) { 
      ticketInCart.classList.remove(BOOKED);
      let tsb = ticketInCart.querySelectorAll('.book-ticket-place .text-secondary-booked');
      tsb.forEach(tsbChild => tsbChild.remove())
      ticketInCart.querySelector('.additional-options').classList.remove('hide')
    }
  }

  static getCoordinatSeat(i, j, k) {
    let areaNumber = hallSeats.SeatLayoutData.Areas[i].Number                      // areaNumber
    let seatId = hallSeats.SeatLayoutData.Areas[i].Rows[j].Seats[k].Id             // Місце
    let rowPhysicalName = hallSeats.SeatLayoutData.Areas[i].Rows[j].PhysicalName   // Ряд   
    return { areaNumber, seatId, rowPhysicalName }
  }

  static getSeatOnSchemeByAPR(opt) {
    return document.querySelector(
      `[${TICKET_ON_SCHEME}]` +
      `[${TICKET_AREA_NUMBER_ATTR}="${opt.areaNumber}"]` +
      `[${TICKET_PLACE_ATTR}="${opt.seatId}"]` +
      `[${TICKET_ROW_ATTR}="${opt.rowPhysicalName}"]`      
    );
  }

  static getTicketInCartByAPR(opt) {
    return document.querySelector(
      `[${TICKET_IN_CART}]` +
      `[${TICKET_AREA_NUMBER_ATTR}="${opt.areaNumber}"]` +
      `[${TICKET_PLACE_ATTR}="${opt.seatId}"]` +
      `[${TICKET_ROW_ATTR}="${opt.rowPhysicalName}"]`
    );
  }  
}
