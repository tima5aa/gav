/**
 * Усі кнопки, що змінюють активність GPay - показують / ховають
 */
let changeActiviyBtnGPay = document.querySelectorAll('[js-change-activity-btn-google-pay]')

function getPaymentType() {
  let el = document.querySelectorAll('.payment-type')
  let i = -1
  while (i++ < el.length) {
    if (el[i].classList.contains('active')) {
      return el[i].dataset.paymentType
    }
  }
  return 'undefined'
}

// function getGAClientId() {
//   if (!ga) return 'Not finded javascript library Google Analitycs';
//   return ga.getAll()[0].get('clientId');
// }

// function getFormatTel(tel) {
//   if (tel.length === 9 && +tel[0] !== 0) tel = '380' + tel;
//   if (tel.length === 10) tel = '38' + tel;
//   if (tel.length === 11) tel = '3' + tel;
//   return tel
// }

function getPaymentData() {
  return Object.assign(
    {
      payType: getPaymentType(),
      tos_agreed: isUserClickTosAgreed()
    },
    getUserInfo()
  )
}

function addListenersTosAgreed() {
  document.querySelectorAll('.checkout-agreement').forEach(el => el.addEventListener('click',
    e => {
      e.stopPropagation()
      checkTosAgreed({
        agreeBlock: e.target.closest('.checkout-agreement'),
        isHideToolTip: true
      })
    }
  ))
}

/**
 * Підсвічує вибраний метод оплати Google Pay, Apple Pay або Продожити.
 */
function addListenersBtnPaymentType() {
  let HIDDEN_CLASS = 'hidden'
  let PAYMENT_TYPE_CLASS = 'payment-type'
  document.querySelector('.payment-types').addEventListener('click', e => {
    let clickedPaymentType = e.target.closest(`.${PAYMENT_TYPE_CLASS}`)
    if (clickedPaymentType) {
      e.preventDefault()
      e.stopPropagation()
      document.querySelectorAll(`.${PAYMENT_TYPE_CLASS}`).forEach(el => el.classList.remove('active'))
      clickedPaymentType.classList.add('active')
      showPaymentButton()
    }

    function showPaymentButton() {
      document.querySelectorAll(`[container-btn-pay]`).forEach(el => el.classList.add('hidden'))

      changeActiviyBtnGPay.forEach(el => el.classList.add('hidden'))
      document.querySelectorAll('.user-credentials [data-input-type]').forEach(el => el.disabled = false)

      if (clickedPaymentType.dataset.paymentType === 'googlepay') {
        document.querySelector('#container-gpay-btn')
          .closest('[container-btn-pay]').classList.remove(HIDDEN_CLASS)

        changeActiviyBtnGPay.forEach(el => el.classList.remove('hidden'))
        changeActiviyBtnGPay.forEach(el => prepareGPay())

        return
      }

      if (clickedPaymentType.dataset.paymentType === 'applepay') {
        document.querySelector('#btn-apaybox')
          .closest('[container-btn-pay]').classList.remove(HIDDEN_CLASS)
        return
      }

      document.querySelector('#btn-common-pay')
        .closest('[container-btn-pay]').classList.remove(HIDDEN_CLASS)
    }
  })
}

/**
* Івент, який після кожного натискання кнопки, перевіряє коректніть даних, які користувач набирає в полях: name, phone, email
*/
function addListenersCheckInfo() {
  Object.entries(getUserInfo())
    .forEach(key => {
      let userField = document.querySelector(`.user-credentials [data-input-type="${key[0]}"]`)
      userField.addEventListener('click', e => checkInfo())
      userField.addEventListener('input', e => checkInfo())
    })
}

/**
 * Повертає дані які ввів покупець
 * @returns obj
 * {
 *   "name": name,
 *   "phone": phone,
 *   "email": email
 * }
 */
function getUserInfo() {
  let result = {}
    // якщо не буде ';' тоді отримаємо помилку Unexpected token '...'  
    ;[...document.querySelectorAll('.user-credentials [data-input-type]')].map(e => {
      let _v = e.value
      if (e.dataset.inputType === 'phone') _v = e.value.replace(/[\s\D]/g, '')
      result[e.dataset.inputType] = _v
    })

  return result
}

function checkInfo() {
  let result = true
  Object.entries(getUserInfo()).forEach(key => {
    let userField = document.querySelector(`.user-credentials [data-input-type="${key[0]}"]`)
    if (isShowInvalidMessage(key[0], key[1])) {
      userField.classList.add('invalid')                     // border інпута стає червоним
      userField.nextElementSibling.classList.add('invalid')  // червоний текст знизу під інпутом
      result = false
    } else {
      userField.classList.remove('invalid')
      userField.nextElementSibling.classList.remove('invalid')
    }
  })
  return result
}

function addListenersChangeActivityBtnGooglePay() {
  changeActiviyBtnGPay.forEach(el => el.addEventListener('click',
    () => {
      if (!isAllFieldAndAgreementSet()) return

      plugGpay.isHide()
        ? prepareGPay()
        : processPaymentData()

    }
  ))
}

/**
 * 1. Замінити текст кнопки під інпутами покупця
 * 2. Відобразити заглушку кнопки GPay
 * 3. Сховати кнопку GPay
 * 4. name, phone, email - дозволити редагування
 */
function prepareGPay() {
  changeActiviyBtnGPay.forEach(el => el.textContent = 'Продовжити')
  plugGpay.show()
  if (initedGpayButton()) {
    initedGpayButton().classList.add('hide')
  }
  document.querySelectorAll('.user-credentials [data-input-type]').forEach(el => el.disabled = false)
}

/**
 * 1. Замінити текст кнопки під інпутами покупця
 * 2. Сховати заглушку кнопки GPay
 * 3. Відобразити кнопку GPay
 * 4. name, phone, email - заблокувати редагування
 */
function undoPrepareGPay() {
  changeActiviyBtnGPay.forEach(el => el.textContent = 'Редагувати')
  plugGpay.hide()
  if (initedGpayButton()) {
    initedGpayButton().classList.remove('hide')
  }
  document.querySelectorAll('.user-credentials [data-input-type]').forEach(el => el.disabled = true)
}

function isShowInvalidMessage(inputType, value) {
  if (inputType === 'name') {
    let shopperName = value.replace(/[\s\d]/g, '').replace('/r', '/');
    if (shopperName.length > 1) return false
  }
  if (inputType === 'phone') {
    let phone = value.replace(/[\s\D]/g, '')
    // updateMaskPhone(value)
    // Якщо не починається з 380
    if (phone.indexOf('380') !== 0) return true
    if (phone.length === 12) return false
  }
  if (inputType === 'email') {
    let regExp = /^([0-9a-zA-Z_]+[-.+&amp;])*[0-9a-zA-Z_]+@([-0-9a-zA-Z]+[.])+[a-zA-Z]{2,6}$/;
    let isValidEmail = regExp.test(String(value).toLowerCase())
    if (isValidEmail) return false
  }
  return true
}

/**
 * @returns true - Якщо інпути покупця не коректні.
 * @returns false - інпути покупця не коректні. (Зазвичай -> вихід)
 */
function isAllFieldAndAgreementSet() {
  if (checkInfo() && isUserClickTosAgreed()) {
    return true
  }

  btnNextBlinkin()
  return false
}

function btnNextBlinkin() {
  buttonsNext.forEach(e => e.classList.add('invalid'))
  let gpayButton = document.querySelector('.gpay-button')
  if (gpayButton) gpayButton.classList.add('invalid')

  setTimeout(function () {
    buttonsNext.forEach(e => e.classList.remove('invalid'))
    if (gpayButton) gpayButton.classList.remove('invalid')
  }, 1500)
}

/**
 * Перевіряє чи поставив покупець галочку "Погоджуюсь з правилами ..." 
 * У разі необхідності підсвічує поле червоним та показує підказку
 * @returns true або false. Якщо немає такого поля - false.Z
 */
function isUserClickTosAgreed() {
  let result = false
  let resultCorection = true
  document.querySelectorAll('.checkout-agreement').forEach(agreeBlock => {
    result = checkTosAgreed({ agreeBlock })
    if (result === false) resultCorection = false
  })

  return result && resultCorection
}

function checkTosAgreed({ agreeBlock, isHideToolTip = false }) {
  if (agreeBlock.querySelector('input').checked || isHideToolTip) {
    agreeBlock.querySelector('.checkout-agreement-tooltip').classList.add('hide')
    agreeBlock.classList.remove('border-red')
    return true
  } else {
    agreeBlock.classList.add('border-red')
    agreeBlock.querySelector('.checkout-agreement-tooltip').classList.remove('hide')
    window.scrollTo(0, agreeBlock.getBoundingClientRect().top)
    return false
  }
}

function processPaymentData() {
  if (!isAllFieldAndAgreementSet()) return

  saveUserInfoIntoCookies()

  showPreloadAnim()
  sendWebRequest(getPaymentData())
    .then(response => {
      if ('payType' in response && response.payType !== '') {
        let respPayTypeEl = document.querySelector(`[data-payment-type="${response.payType}"]`)
        if (respPayTypeEl) {
          showPreloadAnim()

          /**
           * payTypeFunc is like as:
           * process_googlepay
           * process_liqpay
           * process_internal
           * process_privatpay
           */

          let payTypeFunc = respPayTypeEl.getAttribute('data-payment-func')
          // window[payTypeFunc](response)
          callPaymentFuncByName[payTypeFunc](response)
        }
        else {
          // console.error(`Element [data-payment-type="${response.payType}"] not found`)
        }
      }
      else {
        // console.error('"payType" not in response or response.payType is Empty string')
      }

    })
    .catch(data => {
      console.error('Failed response', data)
      hidePreloadAnim()
    })
}

function process_googlepay(response) {
  hidePreloadAnim()

  if (response.PayDef && response.PayDef.transactionInfo) {
    initGPay(response)
    undoPrepareGPay()
  } else {
    // console.error(`NOT EXIST REQUIRED FIELDS:\nresponse.PayDef\nor\nresponse.PayDef.transactionInfo`)
  }
}

let callPaymentFuncByName = {
  'process_liqpay': (o) => { process_liqpay(o) },
  'process_internal': (o) => { process_internal(o) },
  'process_googlepay': (o) => { process_googlepay(o) },
  'process_privatpay': (o) => { process_privatpay(o) }
}

function process_liqpay(response) {
  LiqPayCheckoutCallback(response)
}

function process_internal(response) {
  sendWebRequest(getUserInfo(), response.uri)
    .then(mxResp => {
      let backEndRespPayment = {
        mxResp: mxResp,
        mxRespSuccess: true
      }
      moveToTicketsPage(backEndRespPayment)
    })
    .finally(() => hidePreloadAnim())
}

function process_privatpay(response) {
  if (response.PayDef.result === 'ok') {
    let url = response.PayDef.url_privatpay
    window.location.href = url
    // Якщо редірект в браузері не відбувся. Буває коли браузер блокує таку дію.
    showModalGoToPrivatPay(url)
    periodicalyCheckServerResponse()
  }
  hidePreloadAnim()
}

let checkResp = null
function periodicalyCheckServerResponse() {
  let intervalMS = 1000; // miliseconds
  let maxTimeWaiting_Second = 600; // 10 minutes
  let maxQtyCheck = maxTimeWaiting_Second * 1000 / intervalMS;
  let qtyCheck = 0;
  checkResp = setInterval(() => {
    qtyCheck++;
    if (qtyCheck < maxQtyCheck) {
      sendWebRequest({}, 'status', false).then(resp => {
        if ('status' in resp && resp.status === 2) {
          window.location.href = 'tickets'
        }
      })
    } else {
      clearInterval(checkResp)
    }
  }, intervalMS)
}

/**
 * data.PayDef.data
 * data.PayDef.signature
 * data.uri
 */
let LiqPayCheckoutCallback = function (objReq) {
  let backEndRespPayment = {
    mxResp: {},
    mxRespSuccess: true,
    liqPayClosed: { cmd: "Модальне вікно LiqPay не закрите. Очікуємо закриття..." }
  }

  LiqPayCheckout.init({
    data: objReq.PayDef.data,
    signature: objReq.PayDef.signature,
    language: "uk",
    embedTo: "#liqpay_checkout",
    mode: "popup" // embed || popup
  }).on("liqpay.callback", function (data) {
    // console.log(data)
    let body = { data: data.notify.data, signature: data.notify.signature }
    // Send signature to backend
    backEndRespPayment.mxRespSuccess = false
    sendWebRequest(body, objReq.uri, false)
      .then(mxResp => {
        backEndRespPayment.mxResp = mxResp
        backEndRespPayment.mxRespSuccess = true
        moveToTicketsPage(backEndRespPayment)
      })
      .catch(e => {
        // console.log(e)
      })

  }).on("liqpay.ready", function (data) {
    showPreloadAnim()
    // Вікно Лікпея почало з'являтися
  }).on("liqpay.close", function (data) {
    backEndRespPayment.liqPayClosed = data
    moveToTicketsPage(backEndRespPayment)
  });
};

/**
 * resp.liqPayClosed.cmd = 'liqpay.close', оплата відбулась за допомогою Лікпея, отже треба перевірити чи закрите вікно Лікпея
 */
function moveToTicketsPage(resp) {
  let mxResp = resp.mxResp
  if ('status' in mxResp && mxResp.status === 2
    // && 'details' in mxResp
    // && 'ticket_status' in mxResp.details
    // && mxResp.details.ticket_status === 2
  ) {
    // якщо Лікпей, тоді перевіряємо чи закрите вікно Лікпея
    if ('liqPayClosed' in resp) {
      if (resp.liqPayClosed.cmd === 'liqpay.close') {
        hidePreloadAnim()
        window.location.href = 'tickets'
      }
    } else {
      // Internal Payment, GooglePay, ApplePay
      hidePreloadAnim()
      window.location.href = 'tickets'
    }
  } else {
    // console.log('Помилка в процесі оплати:')
    // console.dir(mxResp)
  }

  /**
   * Може бути випадок коли відкрили вікно Лікпея і не вводячі реквізити карти закрили. В такому випадку потрібно вимкнути прелоадер
   */
  if ('mxRespSuccess' in resp && resp.mxRespSuccess === true
    && 'liqPayClosed' in resp && resp.liqPayClosed.cmd === 'liqpay.close'
  ) {
    hidePreloadAnim()
  }

}

/**
 * Автоклік на перший доступний метод оплати
 * @pm DOMElement - вибраний метод оплати (payment method)
 * @return
 */
function clickPaymentMethod(pm) {
  if (pm) {
    let eventSelectPaymentType = new Event('click', { bubbles: true, cancelable: true })
    pm.dispatchEvent(eventSelectPaymentType)
  }
}

function initDOMContentLoaded() {
  // на випадок об'єднання всіх js в одни бандл - один js для всіх сторінок
  if (page !== 'checkout') return

  setCookieIntoUserFields()
  addListenersBtnPaymentType()
  addListenersCheckInfo()
  addListenersTosAgreed()
  addListenersChangeActivityBtnGooglePay()

  // цей крок можна робити після того як створили Event Listeners для кнопок вибору способу оплати
  if (page === 'checkout') {
    // При завантаженні сторінки, вибираємо тип оплати по замовчуванню. Перший у списку.
    let pm = document.querySelectorAll('.payment-type')[0]
    clickPaymentMethod(pm)
  }
}

function initLoad() {
  // На випадок якщо цей js буде підключений на іншій сторінці. Таке може трапитись якщо з усіх файлів зробити один бандл
  if (page !== 'checkout') return

  if (isExistGooglePay) {
    // Клікаємо тип оплати Google Pay
    clickPaymentMethod(document.querySelector('[data-payment-func="process_googlepay"]'))
  }
}

window.addEventListener('DOMContentLoaded', initDOMContentLoaded)
window.addEventListener('load', initLoad)
