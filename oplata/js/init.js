let buttonsNext = document.querySelectorAll("[js-btn-next]")
let allTicketsOnScheme
let isRestartTimer = false
let timerToEndSession = 60 * 7 // Після кожного реквеста на сервер, сесія продовжується на 7 хв. Тому після кожного реквеста timer = timerToEndSession
let timer = 60 * 7   // Початкове значення таймера в секундах. Значення по замовчуванню 7 хв. Але якщо є в кукі залишок секунд з поперднього відрахунку, тоді timer = секундам з кукі
let timerCookieName = 'timer' + getUserSessionId()


window.addEventListener('DOMContentLoaded', init)

function init() {
  setOnClickBtnNext()

  // запуск таймера завершення часу сесії
  let getTimerFromCookie = getCookieByName(timerCookieName)
  if (getTimerFromCookie) timer = +getTimerFromCookie
  beginTimer()

  if ("IsPoufSessionCinema" in window && "showThisIsPoufSession" in window) {
    if (IsPoufSessionCinema) {
      showThisIsPoufSession()
    }
  }
}

function setOnClickBtnNext() {
  let funcNextBtn;

  switch (page) {
    case 'seatplan':
      funcNextBtn = processBookTickets
      CreateEvenSource.listen(eventSourceUrl)
      if (typeof IsCARSession !== 'undefined' && IsCARSession) {
        initKinodrom()
      }
      break
    case 'concession':
      funcNextBtn = processBookConcession
      checkBtnNextAvailable()
      break
    case 'checkout':
      funcNextBtn = processPaymentData
      break
  }

  // btnNext.onclick = processBookTickets; // На iOS телефонах не працює
  document.body.addEventListener('click', e => {
    let el = e.target
    if (el.hasAttribute('js-btn-next')) {
      funcNextBtn()
    }
  })
}

function checkBtnNextAvailable() {
  enableBtnNext()
  if (getCartConsQty() === 0 && getCartTicketQty() === 0) {
    disableBtnNext()
    return false
  }
  return true
}

function enableBtnNext() {
  buttonsNext.forEach(e => e.classList.remove('disabled'))
}

function disableBtnNext() {
  buttonsNext.forEach(e => e.classList.add('disabled'))
}

function showPreloadAnim() {
  let vPreAnim = document.getElementById('preload-anim')
  if (vPreAnim) vPreAnim.style.display = 'block'
}

function hidePreloadAnim() {
  let vPreAnim = document.getElementById('preload-anim')
  if (vPreAnim) vPreAnim.style.display = 'none'
}

function getUserSessionId(path = window.location.pathname) {
  let cartUriName = '/cart/'
  let user_session_id = ''
  if (path.indexOf(cartUriName) === 0) {
    let startSessionId = path.substring(cartUriName.length)
    user_session_id = startSessionId.substring(0, startSessionId.indexOf('/'))
  }
  return user_session_id
}

async function sendWebRequest(body, uri = '', isShowPreload = true) {
  if (isShowPreload) showPreloadAnim()

  let data = {}
  try {
    let postRequest = await fetch(
      uri,
      {
        method: 'POST',             // *GET, POST, PUT, DELETE, etc.
        mode: 'cors',               // no-cors, cors, *same-origin
        cache: 'no-cache',          // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': CSRF,
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        // referrer: 'seatplan', // no-referrer, *client
        body: JSON.stringify(body),
      }
    )

    // console.log(postRequest)
    if (postRequest.ok) {
      data = await postRequest.json()
    } else {

      if (+postRequest.status === 500) {
        console.error('Status: ' + postRequest.status + '\n' + postRequest.text)
        showModalFullScreen(
          'Щось пішло не так, спробуйте ще раз',
          true
        )
      }

      if (+postRequest.status === 404) {
        showModalFullScreen(postRequest.text)
      }

    }
  } catch (e) {
    console.error(e)
  } finally {
    if (isShowPreload) hidePreloadAnim()
  }

  if (uri.indexOf('/voucher') === -1) {
    isRestartTimer = true
  }

  return data
}

// timer

let isShownModalTimer = false
function beginTimer() {

  setCookie(timerCookieName, timer, 1)

  let fxMinutes = document.querySelectorAll(".minutes")
  let fxSeconds = document.querySelectorAll(".seconds")
  let minutes, seconds

  let startTimer = setInterval(function () {

    seconds = parseInt(timer % 60, 10)
    seconds = seconds < 10 ? "0" + seconds : seconds

    minutes = parseInt(timer / 60, 10)
    minutes = minutes < 10 ? "0" + minutes : minutes

    if (fxMinutes.length > 0) {
      for (var i = 0; i < fxMinutes.length; i++) {
        fxMinutes[i].innerHTML = minutes
      }
    }

    if (fxSeconds.length > 0) {
      for (var i = 0; i < fxSeconds.length; i++) {
        fxSeconds[i].innerHTML = seconds
      }
    }

    if (isRestartTimer) {
      isRestartTimer = false
      clearInterval(startTimer)
      timer = timerToEndSession
      beginTimer()
    }

    // timerForGPayPayment = timer;

    if (--timer < 0) {
      timer = 0

      clearInterval(startTimer)
      document.title = `🍿 Multiplex`

      if (!isShownModalTimer) {
        closeAllModal()
        showModalFullScreen('Час на оформлення замовлення вийшов.')
        isShownModalTimer = true
      }
    }

    setCookie(timerCookieName, timer, 1)

  }, 1000)
}

function closeAllModal() {
  let allModal = document.querySelectorAll('[modal]')
  allModal.forEach(el => el.classList.add('hide'))
  makeBodyScrollable()
}

//timer







// modal.js
// modal.js
// modal.js
// modal.js
// modal.js

document.body.addEventListener('click', e => {
  let el = e.target
  if (el.closest('[js-close-modal]')) {
    let modal = el.closest('[modal]')
    if (modal) {
      modal.classList.add('hide')
      makeBodyScrollable()
    }
  }
  if (el.closest('[js-close-modal--pouf-session-slide-down]')) {
    let modal = el.closest('[modal]')
    if (modal) {
      let lp = el.closest('.left-part')
      let om = el.closest('.overflow-mask')
      lp.classList.add('modal-content-active')
      om.classList.add('backdrop-filter-out--active')
      setTimeout(() => {
        lp.classList.remove('modal-content-active')
        om.classList.remove('backdrop-filter-out--active')
        modal.innerHTML = '';
      }, 800)
      makeBodyScrollable()
    }
  }
})

let initModal = document.querySelector('[modal]')
if (initModal && !initModal.classList.contains('hide')) {
  makeBodyNotScrollable()
}

function makeBodyNotScrollable() {
  document.body.classList.add('body-no-scroll')
}

function makeBodyScrollable() {
  document.body.classList.remove('body-no-scroll')
}

function insertIntoBody(text) {
  let str = `<div class="wrap-modal" modal>${text}</div>`
  document.body.insertAdjacentHTML('beforeend', str)
  makeBodyNotScrollable()
}

function showModalGoToPrivatPay(url) {
  document.body.querySelector(".widget").style.display = 'none'
  let str = `
    <div class="info_message">
      <div class="info_message__wrap_title">Завершення покупки буде здійснене в окремому вікні.</div>
      <div class="text-center">
        <img alt="image" src="/img/widget/checkout/open_pay.png">
      </div>         
      <div>
        <a class="send_error_common go_index" target="_parent" href="${url}">Перейти до сплати</a>        
        <a class="send_error_common other_payment" href="checkout">Обрати інший метод оплати</a>       
        <a class="send_error_common" target="_parent" href="https://multiplex.ua" >Повернутись на головну</a>
      </div>
    </div>   
  `
  insertIntoBody(str)
}

function showModalFullScreen(text, isShowCloseBtn = false) {
  let closeBtn = ''
  if (isShowCloseBtn) {
    closeBtn =
      '<a class="send_error_common faq_m" js-close-modal href="javascript:;">Закрити</a>'
  }

  let str = `
    <div class="info_message">
      <div class="info_message__wrap_title">${text}</div>
      <div class="text-center">
        <img alt="error" src="/img/widget/error/error_screen.png">
      </div>         
      <div>
        <a class="send_error_common go_index" target="_parent"  href="https://multiplex.ua">
          <span>На головну</span>
        </a>
        <a class="send_error_common faq_m" href="https://multiplex.ua/ua/faq">
          <span>Допомога</span>
        </a>
        ${closeBtn}
      </div>
    </div>   
  `
  insertIntoBody(str)
}

function showThisIsPoufSession() {
  let str = `
      <div class="pouf-modal-window">
          <div class="background"></div>
          <div class="overflow-mask">
              <div class="left-part">
                  <div class="top-red-line" js-close-modal--pouf-session-slide-down></div>
                  <div class="mob-bg">
                      <div class="left-content">
                          <div class="left-content--top">
                              <div class="line-button" js-close-modal--pouf-session-slide-down>
                                  <div></div>
                              </div>
                              <h1>
                                  <span class="criss-cross" js-close-modal--pouf-session-slide-down>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                          <path d="M1 1L17 17" stroke="white" stroke-width="2" />
                                          <path d="M17 1L1 17" stroke="white" stroke-width="2" />
                                      </svg>
                                  </span>
                                  CHILL OUT
                              </h1>
                              <h2>Зал з пуфами замість крісел</h2>
                          </div>
                          <div class="buttons">
                              <div class="btn-main" js-close-modal>Продовжити</div>
                              <div class="btn-secondary" onclick="history.back();">Обрати інший сеанс</div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    `
  if (insertIntoBody) {
    insertIntoBody(str)
  }
}




// modal.js
// modal.js
// modal.js
// modal.js
// modal.js
