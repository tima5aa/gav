let LIST_OF_ITEMSBAR_IN_ORDER = 'list-of-itemsbar-in-order'
let MAX_COUNT = 9

function ItemInSideBar_draw(obj) {

  draw()

  function draw() {
    let asideItem = null
    if (isExistItemInAside()) {
      asideItem = updateAsideItem()
    } else {
      asideItem = createAsideItem()
      document.getElementById(LIST_OF_ITEMSBAR_IN_ORDER).insertAdjacentHTML("beforeend", asideItem);
    }
  }

  function isExistItemInAside() {
    let asideItem = document.querySelector(`[data-item-id="${obj.itemId}"][aside-bar-item]`)
    if (asideItem)
      return true
    else
      return false
  }

  function updateAsideItem() {
    let asideItem = document.querySelector(`[data-item-id="${obj.itemId}"][aside-bar-item]`)
    asideItem.setAttribute('data-cart-quantity', obj.cartQuantity)
    asideItem.querySelector('.summary').innerHTML = getSummary()
    asideItem.querySelector('.bar-item-sum strong').innerHTML = getBarItemSum()
  }

  function getSummary() {
    return `(${obj.cartQuantity} шт * ${obj.price} грн)`
  }

  function getBarItemSum() {
    return `${obj.cartQuantity * obj.price}<small> грн</small>`
  }

  function createAsideItem() {
    return `
      <li class="book-bar-item book-stripe" data-item-id="${obj.itemId}" data-price="${obj.price}" data-description="${obj.description}" data-final-price-in-cents="${obj.finalPriceInCents}" data-head-office-item-code="${obj.headOfficeItemCode}" data-cart-quantity="${obj.cartQuantity}" aside-bar-item>
        <div>
            <img class="bar-item-img" src="https://dc1-vweb2-win12.multiplex.ua/CDN/media/entity/get/ItemGraphic/${obj.itemId}?allowPlaceHolder=true&width=200">
        </div>
        <div class="bar-item-title">${obj.description}<br>
          <span class="summary">${getSummary()}</span>
        </div>
        <div class="bar-item-sum"><strong>${getBarItemSum()}</strong></div>
        ${getCrissCross()}
      </li>	    
    `
  }

  function getCrissCross() {
    return page === 'concession'
      ? `
          <a class="book-ticket-remove" cart-cons-remove>
              <svg class="icon">
                  <use xlink:href="#close"></use>
              </svg>
          </a>      
        `
      : ''
  }
}

function getAttrOfConsItem($el, modal = '') {
  let e = $el.closest(`${modal} [data-item-id]`)
  return {
    itemId: e.dataset.itemId,
    headOfficeItemCode: e.dataset.headOfficeItemCode,
    voucherBarcode: '',
    price: +e.dataset.price,
    finalPriceInCents: +e.dataset.finalPriceInCents,
    description: e.dataset.description,
    cartQuantity: +e.getAttribute(`data-cart-quantity`)
  }
}

function processBookConcession() {
  sendWebRequest(getCartCons())
    .then(data => {
      if (data.url) {
        if (checkBtnNextAvailable()) {
          window.location.pathname = data.url;
        }
      }
    })
    .catch(data => {
      showModalFullScreen(data)
    })
}

function getAllConsInCart() {
  return document.querySelectorAll(`[data-item-id][aside-bar-item]`)
}

function getCartCons() {
  let data = {
    concessions: []
  }

  let cartCons = getAllConsInCart()
  cartCons.forEach(el => {
    let obj = getAttrOfConsItem(el)
    data.concessions.push({
      "itemId": obj.itemId,
      "quantity": obj.cartQuantity,
      "headOfficeItemCode": obj.headOfficeItemCode,
    })
  })
  return data
}

function getAllObjectsAttrAside() {
  let allCons = []
  let cartCons = getAllConsInCart()
  cartCons.forEach(el => allCons.push(getAttrOfConsItem(el)))
  return allCons
}

function getCartConsSum() {
  let sum = 0
  getAllObjectsAttrAside().forEach(el => sum += el.price * el.cartQuantity)
  return sum
}

function getCartConsQty() {
  let sum = 0
  getAllObjectsAttrAside().forEach(el => sum += el.cartQuantity)
  return sum
}

function setQtyById_inMainCons(itemId, qty, modal = '') {
  let quantity = 'data-count'
  let barItem = document.querySelector(`${modal} .concession-items [data-item-id="${itemId}"]`)
  barItem.setAttribute('data-cart-quantity', qty)
  barItem.querySelector(`[${quantity}]`).setAttribute(`${quantity}`, qty)
}

function isCanAddConsToCart(itemId) {

  let allObjectsAttrAside = getAllObjectsAttrAside()
  // if (allObjectsAttrAside.length === 0) return true


  let RESTRICT = {
    CART_SIZE: 0,
    ITEM_QTY: 1
  }

  let obj
  let maxItemSize = MAX_COUNT
  let maxCartSize = MAX_COUNT
  let itemInCart = allObjectsAttrAside.find(el => el.itemId === itemId)

  /**
   * @param {BigInteger} maxItemSize максимальна кількіть однієї позиції в корзині, наприклад 3 шт;
   * @param {BigInteger} maxItemSize максимальна кількіть різних товарів в корзині (SKU), наприклад 1 шт;
   */
  if (window.hasOwnProperty('cartType')) {
    if (cartType === 'cert') {
      maxItemSize = 3
      maxCartSize = 1
    }

    // if (window.hasOwnProperty('cinemaId')) {
    //   // Для Komod дозволено продаж лише одного сертифіката в чеку
    //   if ('0000000001' === cinemaId) {
    //     maxItemSize = 1
    //   }
    // }
  }


  if (itemInCart) {
    obj = {
      id: RESTRICT.ITEM_QTY,
      itemInCart: itemInCart,
      cartSize: 'not used',
      maxQty: maxItemSize
    }
  } else {
    obj = {
      id: RESTRICT.CART_SIZE,
      itemInCart: 'not used',
      cartSize: allObjectsAttrAside.length,
      maxQty: maxCartSize
    }
  }

  if (!showCountRestrict(obj)) return false

  return true



  function showCountRestrict({ id, itemInCart, cartSize, maxQty }) {
    return processingRestrict({ id, itemInCart, cartSize, maxQty })


    function processingRestrict({ id, itemInCart, cartSize, maxQty }) {
      let qtyVal = 0
      if (id === RESTRICT.ITEM_QTY) qtyVal = itemInCart.cartQuantity
      if (id === RESTRICT.CART_SIZE) qtyVal = cartSize

      if (qtyVal + 1 > maxQty) {
        let TIMEOUT_SHOW_MESSAGE = 3000
        let { message_id, message } = getMessageById(id, itemInCart, qtyVal)

        if (!document.getElementById(message_id)) {
          document.getElementById(`aside-info-concession-messages`)
            .insertAdjacentHTML("afterbegin", `<li id="${message_id}" style="color:red;">${message}</li>`);

          setTimeout(
            function () {
              let element = document.getElementById(message_id)
              if (element) element.remove();
            },
            TIMEOUT_SHOW_MESSAGE
          )
        }

        return false
      }

      return true
    }

    function getMessageById(id, item, qtyInCart) {
      if (id === RESTRICT.CART_SIZE) return getRestrictCartSize(qtyInCart)
      if (id === RESTRICT.ITEM_QTY) return getRestrictItemQty(item)
    }

    function getRestrictCartSize(qtyInCart) {
      let d_id = Date.now()
      let message_id = `count-concession-more-than-allow-size-${d_id}`
      let message = `Максимальна кількіть одиниць продукції ${qtyInCart} од.`
      return { message_id, message }
    }

    function getRestrictItemQty(item) {
      let d_id = Date.now()
      let message_id = `count-concession-more-than-allow-item-count-${d_id}`
      let message = `Максимальна кількість однієї позиції "${item.description}" ${item.cartQuantity} од.`
      return { message_id, message }
    }
  }
}

document.body.addEventListener('click', e => {

  if (e.target.closest('[btn-plus]')) {
    let obj = getAttrOfConsItem(e.target)
    if (isCanAddConsToCart(obj.itemId)) {
      let qty = ++obj.cartQuantity
      setQtyById_inMainCons(obj.itemId, qty)
      ItemInSideBar_draw(obj)
      redrawingSumAndCountInAside()
      enableBtnNext()
    }
  }

  if (e.target.closest('[btn-minus]')) {
    let obj = getAttrOfConsItem(e.target)
    let qty = --obj.cartQuantity
    if (qty < 0) qty = 0
    setQtyById_inMainCons(obj.itemId, qty)

    if (qty > 0) {
      ItemInSideBar_draw(obj)
    } else {
      let asideItem = document.querySelector(`[data-item-id="${obj.itemId}"][aside-bar-item]`)
      if (asideItem) {
        asideItem.remove()
      }
    }

    redrawingSumAndCountInAside()
    checkBtnNextAvailable()
  }

  // Модальне вікно для 3D окулярів.
  if (e.target.closest('[btn-plus-additional]')) {
    let obj = getAttrOfConsItem(e.target)
    if (obj.cartQuantity < MAX_COUNT) {
      let qty = ++obj.cartQuantity
      setQtyById_inMainCons(obj.itemId, qty, '[modal]')
    }
  }

  // Модальне вікно для 3D окулярів.
  if (e.target.closest('[btn-minus-additional]')) {
    let obj = getAttrOfConsItem(e.target)
    let qty = --obj.cartQuantity
    if (qty < 0) qty = 0
    setQtyById_inMainCons(obj.itemId, qty, '[modal]')
  }

  if (e.target.closest('[cart-cons-remove]')) {
    let asideBarItem = e.target.closest(`[aside-bar-item]`)
    if (asideBarItem) {
      let itemId = asideBarItem.getAttribute('data-item-id')
      asideBarItem.remove()
      setQtyById_inMainCons(itemId, 0)
      redrawingSumAndCountInAside()
      checkBtnNextAvailable()
    }
  }

  // Close the modal
  // Хендлер модального вікна додавання 3D окурів.
  if (e.target.closest('[add-additional-to-order]')) {
    makeBodyScrollable()

    let modal = e.target.closest('[modal]')
    let listOfAdditionalBarItems = modal.querySelectorAll('.bar-item')
    listOfAdditionalBarItems.forEach(barItem => {
      let obj = getAttrOfConsItem(barItem, '[modal]')
      if (+obj.cartQuantity > 0) {
        ItemInSideBar_draw(obj)
        setQtyById_inMainCons(obj.itemId, obj.cartQuantity)
      }
    })
    modal.classList.add('hide')
    redrawingSumAndCountInAside()
    checkBtnNextAvailable()
  }
})

