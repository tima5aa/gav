function registerEventApplyLoyalty($toggle) {
  let ticketInCart = $toggle.closest(`[${TICKET_IN_CART}]`)  
  let ticketAttr = getSeatAttrByCartTicket(ticketInCart)
  // Встановлюємо усі сусідні тумблери в положення вимкнено
  uncheckedAllSiblingToggles($toggle)
  let hopk = $toggle.getAttribute('data-hopk')
  let loyPrice = $toggle.getAttribute(TOGGLE_LOYALTY_PRICE)
  let loyTypeCode = $toggle.getAttribute(TOGGLE_LOYALTY_TYPE_CODE)
  
  
  // зміна моделі
  if ($toggle.checked) {
    ticketInCart.setAttribute(TICKET_FINAL_PRICE_ATTR, loyPrice)
    ticketInCart.setAttribute(TICKET_TYPE_CODE_ATTR,   loyTypeCode) 
    setSeatColor(hopk)
    setBorderColorTicketInCart(hopk)
    disabledSectionBarcode($toggle)
  } else {
    ticketInCart.setAttribute(TICKET_FINAL_PRICE_ATTR, ticketAttr.price) 
    ticketInCart.setAttribute(TICKET_TYPE_CODE_ATTR,   ticketAttr.ticketTypeCode)
    removeSeatColor(hopk)
    removeBorderColorTicketInCart(hopk)
    enableSectionBarcode($toggle)
  }           
  // перемальовування ціни білета в корзині
  let $price = ticketInCart.querySelector(`.book-ticket-price strong`)
  $price.innerHTML = ticketInCart.getAttribute(TICKET_FINAL_PRICE_ATTR) + `<small> ${CurrencyType}</small>`
  redrawingSumAndCountInAside()




  function setBorderColorTicketInCart(hopk) {
    removeAllClassesByPrefix(ticketInCart, 'bc-')    
    ticketInCart.classList.add(getBC(hopk))
  }

  function removeBorderColorTicketInCart(hopk) {
    ticketInCart.classList.remove(getBC(hopk))
  }

  function getSeat() {
    return getSeatOnSchemeByARC(getSeatAttrByCartTicket(ticketInCart))
  }

  /**
   * Змінюємо колір місця в залі ( прямокутника)
   * @param {*} ticketInCart 
   * @param {*} hopk 
   */
  function setSeatColor(hopk) {
    seatRemoveLoyaltyColor(getSeat())
    getSeat().classList.add(getBGColor(hopk), getBC(hopk))
  }

  function removeSeatColor(hopk)  {
    getSeat().classList.remove(getBGColor(hopk), getBC(hopk))  
  }

  /**
   * background-color
   * @param {*} hopk 
   */
  function getBGColor(hopk) {
    return `bg-${hopk}`
  }

  /**
   * border-color
   * @param {*} hopk 
   */
  function getBC(hopk) {
    return `bc-${hopk}`
  }

  function uncheckedAllSiblingToggles() {
    let loyBox = $toggle.closest(`[${TICKET_IN_CART_JS_LOYALTY_BOX}]`)
    if (loyBox) {
      let toggles = loyBox.querySelectorAll(`[${TICKET_IN_CART_JS_LOYALTY_BOX}] [js-loyalty-toggle]`)
      toggles.forEach(el => { if (el !== $toggle) el.checked = false })
    }
  }

  function disabledSectionBarcode() {
    let box = $toggle.closest(`.additional-options`)
    if (box) {
      box.querySelector(`[js-section-barcode]`).classList.add('opacity')
      let input = box.querySelector(`[input-barcode]`)
      if (input) input.disabled = true
      let btn = box.querySelector(`.barcode-btn`)
      if (btn) btn.removeAttribute(`btn-check-barcode`)
      let ci = box.querySelector(`.criss-cross`)
      if (ci) ci.removeAttribute(`js-clear-input`)      
    }
  }

  function enableSectionBarcode() {
    let box = $toggle.closest(`.additional-options`)
    if (box) {
      box.querySelector(`[js-section-barcode]`).classList.remove('opacity')
      let input = box.querySelector(`[input-barcode]`)
      if (input) input.disabled = false
      let btn = box.querySelector(`.barcode-btn`)
      if (btn) btn.setAttribute(`btn-check-barcode`, '')
      let ci = box.querySelector(`.criss-cross`)
      if (ci) ci.setAttribute(`js-clear-input`, '')
    }
  }

}

function seatRemoveLoyaltyColor($seat) {
  removeAllClassesByPrefix($seat, 'bg-')
  removeAllClassesByPrefix($seat, 'bc-')  
}

function removeAllClassesByPrefix(el, prefix) {
  let classes = el.className.split(" ").filter(c => !c.startsWith(prefix))
  el.className = classes.join(" ").trim();
}