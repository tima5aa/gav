
// Social Distance

let DATA_MARK_TEMPORARY_SELECTED = 'data-mark-temporary-selected'
let TOOLTIP_SEAT_SOCIAL_MESSAGE = 'Місце заблоковано\nдля дотримання вимог\nсоціального дистанціювання'

/**
 * Функція повертає true якщо місце можна забронювати згідно політики соціального дистанціювання.
 * @param {*} $seat - Клікнуте користувачем місце.
 * @param {*} MAX_SEAT_ALONGSIDE - Максимальна кількість місць підряд для бронювання.
 * @param {*} SOCIAL_DISTANCE_SPACE - Кількість місць соціальної дистанції. Для SOCIAL_DISTANCE_SPACE>1,- алгоритм потрібно доробити.
 * @param {*} isAddingTicket - true якщо місце добавляється в корзину. Інакше false.
 */
function isAllowtSocialDistance({$seat, MAX_SEAT_ALONGSIDE, SOCIAL_DISTANCE_SPACE}, isAddingTicket = false) {
  let ticketAttr = getSeatAttr($seat) 
  if (getAllSeatsInRow(ticketAttr).length <= MAX_SEAT_ALONGSIDE) return true

  let isAllowBookingSeat = false  
  if (isAddingTicket) $seat.setAttribute(DATA_MARK_TEMPORARY_SELECTED, 1) 
  let aroundTarget = getCountFreeSeatsAroundTarget({ticketAttr, useUserSession: false})
  isAllowBookingSeat = isAllowBooking_SD_B(aroundTarget.freeRight)
  isAllowBookingSeat = isAllowBooking_SD_B(aroundTarget.freeLeft)

  createCopyAttrSocialDistanceStatus(ticketAttr)
  clearSocialDistanceStatus(ticketAttr)  
  let countSeatUserCanSelectAround = aroundTarget.freeLeft.count + aroundTarget.freeRight.count + 1 // +1 - це поточне місце
  if (countSeatUserCanSelectAround >= MAX_SEAT_ALONGSIDE) {
    // Витримана соціальна дистанція
    if (countSeatUserCanSelectAround === MAX_SEAT_ALONGSIDE) {
      checkFor4(ticketAttr)   
    }
    isAllowBookingSeat = true
  }  
  
  if (isAddingTicket) $seat.setAttribute(DATA_MARK_TEMPORARY_SELECTED, 0)

  return isAllowBookingSeat



  function isAllowBooking_SD_B(target) {
    if (target.nextSeat.isExist) {
      let st = target.nextSeat.$seat.getAttribute(TICKET_STATUS_ATTR)
      if (st === TICKET_STATUS.SOCIAL_DISTANCE || st === TICKET_STATUS.BROKEN) {
        return true
      }
    } else {
      return true
    }
    return false   
  }

  function getAllSeatsInRow(ticketAttr) {
    return document.querySelectorAll(
      `[${TICKET_ON_SCHEME}]` +
      `[${TICKET_AREA_NUMBER_ATTR}="${ticketAttr.areaNumber}"]` + 
      `[${TICKET_ROW_INDEX_ATTR}="${ticketAttr.rowIndex}"] `      
    )
  }

  /**
   * Повертає об'єкт, в якому кількість вільних місць навколо поточного. Враховуються місця в сесію користувача
   * @param {*} param0 
   * @param {*} useUserSession - Чи враховувати інші місця вибрані користувачем. useUserSession = true - Враховуються місця в сесію користувача
   * 
   */
  function getCountFreeSeatsAroundTarget({ticketAttr, useUserSession}) {
    let freeLeft = getFreeSeatsCount({step: 0, left: true, useUserSession, ...ticketAttr})  
    let freeRight = getFreeSeatsCount({step: freeLeft.count, left: false, useUserSession, ...ticketAttr})
    return {
      freeLeft,
      freeRight
    }
  }
  
  // функція шукає співпадіння на MAX_SEAT_ALONGSIDE місця підряд
  function checkFor4(ticketAttr) {
    if (SOCIAL_DISTANCE_SPACE === 0) return 0
    let allSeatsInRow = getAllSeatsInRow(ticketAttr)
    if (allSeatsInRow.length === 0) return 0

    let rightBorderSeat = allSeatsInRow[0]
    let leftBorderSeat  = allSeatsInRow[0]
    let seatAlongside = 0
    let previusSeatAlongside = seatAlongside
    let freeBtw = 0
    let previousFreeBtw = 0
    let countSocialDistance = 0

    for(let i = 0; i < allSeatsInRow.length; i++) {
      let $seat = allSeatsInRow[i]
      let dmts = $seat.getAttribute(DATA_MARK_TEMPORARY_SELECTED)
      let targetSeat = false
      if (dmts && dmts === '1') targetSeat = true
      
      // Підряд кількість вибраних користувачем місць
      if (TICKET_STATUS.SELECTED === $seat.getAttribute(TICKET_STATUS_USER_SESSION_ATTR) || targetSeat) {
        seatAlongside++
        freeBtw = 0
      } else {
        previusSeatAlongside = seatAlongside
        seatAlongside = 0
      }

      // Якщо вибрано хоча б одне місце - тоді зберігаємо координату правого місця
      if (seatAlongside === 1) {
        rightBorderSeat = $seat // else  rightBorderSeat -> null
      }      

      // Зберігаємо координатму лівого місця
      if (seatAlongside === MAX_SEAT_ALONGSIDE) {    
        leftBorderSeat = $seat
      } 

      // Кількість підряд вільних місць
      if (TICKET_STATUS.FREE === $seat.getAttribute(TICKET_STATUS_USER_SESSION_ATTR) && !targetSeat) {
        freeBtw++
        previousFreeBtw = 0
      }     
        
      if (freeBtw === SOCIAL_DISTANCE_SPACE) {
        previousFreeBtw = freeBtw
        freeBtw = 0
      }

      if (seatAlongside === MAX_SEAT_ALONGSIDE) {    
        setBorderSD(leftBorderSeat, true)
        setBorderSD(rightBorderSeat, false)
      }    

      let chainSeatsAndSpace = seatAlongside + previusSeatAlongside + previousFreeBtw
      if (chainSeatsAndSpace > MAX_SEAT_ALONGSIDE ) {
        setBorderSD(rightBorderSeat, false)
      }
      
      // Підряд кількість місць "Соціальна дистанція"
      if  (  TICKET_STATUS.SOCIAL_DISTANCE === $seat.getAttribute(TICKET_STATUS_USER_SESSION_ATTR)
          || TICKET_STATUS.SOCIAL_DISTANCE === $seat.getAttribute(TICKET_STATUS_USER_SESSION_BC_ATTR)
        ) {
        countSocialDistance++
      }    

      // if (targetSeat) {
        /* 
        let countSeatUserCanSelectAround = previousFreeBtw + freeBtw + 1
        let obj = {
          i,
          MAX_SEAT_ALONGSIDE,
          seatAlongside,
          previusSeatAlongside,
          freeBtw,
          previousFreeBtw,
          countSocialDistance,
          SOCIAL_DISTANCE_SPACE,
          rightBorderSeat,
          leftBorderSeat,
          countSeatUserCanSelectAround
        }
        console.dir(obj) 
        */  
      // }

               
    }
    
  }
 

  // Копія параметра TICKET_STATUS_USER_SESSION_ATTR
  function createCopyAttrSocialDistanceStatus(ticketAttr) {
    getAllSeatsInRow(ticketAttr).forEach($seat => {
        let tsus = $seat.getAttribute(TICKET_STATUS_USER_SESSION_ATTR, TICKET_STATUS.FREE)
        $seat.setAttribute(TICKET_STATUS_USER_SESSION_BC_ATTR, tsus)
    })
  }

  // Усім місцям де є статус соціальна дистанція - ставимо статус вільно
  function clearSocialDistanceStatus(ticketAttr) {
    getAllSeatsInRow(ticketAttr).forEach($seat => {
      if (TICKET_STATUS.SOCIAL_DISTANCE === $seat.getAttribute(TICKET_STATUS_USER_SESSION_ATTR)) {
        $seat.setAttribute(TICKET_STATUS_USER_SESSION_ATTR, TICKET_STATUS.FREE)
        setTootip($seat)
      }
    })
  }
  
  // second version of func setBorderSD: ствить 1,2,3,... і т.д - згідно кількості SOCIAL_DISTANCE_SPACE  
  function setBorderSD($seat, left) {
    let borderAttr = getSeatAttr($seat)
    let seatSN = borderAttr.seatSequenceNumber

    let sdSeats = []
    let add = left ? 1 : -1

    for (let i = 1; i <= SOCIAL_DISTANCE_SPACE; i++) {
      let next = +seatSN + add * i
      let $borderSeat = getSeatOnSchemeByASNR({...borderAttr, seatSequenceNumber: next})
      if ($borderSeat) {
        $borderSeat.setAttribute(TICKET_STATUS_USER_SESSION_ATTR,  TICKET_STATUS.SOCIAL_DISTANCE)
        $borderSeat.setAttribute(TICKET_DATA_TIPPY_ATTR,  TOOLTIP_SEAT_SOCIAL_MESSAGE)
      }
      sdSeats.push($borderSeat)
    }

    return sdSeats
  }  

  function setBorderSD_good_for_1_social_distance($seat, left) {
    let add = left ? 1 : -1
    let borderAttr = getSeatAttr($seat)
    let seatSN = borderAttr.seatSequenceNumber
    let next = +seatSN + add
    let $borderSeat = getSeatOnSchemeByASNR({...borderAttr, seatSequenceNumber: next})
    if ($borderSeat) {
      $borderSeat.setAttribute(TICKET_STATUS_USER_SESSION_ATTR,  TICKET_STATUS.SOCIAL_DISTANCE)
      $borderSeat.setAttribute(TICKET_DATA_TIPPY_ATTR,  TOOLTIP_SEAT_SOCIAL_MESSAGE)
    }
    return $borderSeat
  }        

  /**
   * Кількість вільних місць в ряді від поточного
   * @param {*} param0 
   * @param {*} step 
   * @param {*} left - ліво, право: -1 - ліва сторона, 1 - права сторона
   */
  function getFreeSeatsCount({areaNumber, seatSequenceNumber, rowIndex, step, left, useUserSession}) {
    let LR = left ? 1 : -1
    let hopse = MAX_SEAT_ALONGSIDE + step * LR
    let count = 0
    let places = []
    let columnIndexes = []
    let nextSeat = getNextSeat()

    for(let i = 1; i < hopse; i++) {
      nextSeat = getNextSeat({ areaNumber, seatSequenceNumber, rowIndex, step: LR * i } )
      
      let isExistFreeSeats = false
      let isExistUserSessionSeats = false
      if (nextSeat.isExist) {
        isExistFreeSeats 
            = isAllowBooking(nextSeat.$seat, TICKET_STATUS_ATTR)
        
        if (useUserSession) {
          isExistUserSessionSeats 
            = isAllowBooking(nextSeat.$seat, TICKET_STATUS_USER_SESSION_ATTR)
        }
      } 
      
      if (useUserSession) {
        if (isExistFreeSeats && isExistUserSessionSeats) {
          count++
        } else {
          break
        }
      } else {
        if (isExistFreeSeats) {
          count++
        } else {
          break
        }
      }

      places.push(nextSeat.seatAttr.place)
      columnIndexes.push(nextSeat.seatAttr.columnIndex)
      // console.log('Поруч доступне для бронювання місце', places, 'columnIndexes', columnIndexes)
    }

    return {
      count,
      places,
      columnIndexes,
      isNextExist: nextSeat.isExist,
      nextSeat
    }
  }
  
  /**
   * Функція перевіряє чи існує на схемі зали місце з переданими параметрами
   * @param {*} param0 
   * @param {*} step - число, що вказує на кількість місць від поточного вліво або вправо: число більше нуля - ліва сторона від поточнго місця, менше нуля - права сторона, 0 - поточне місце
   * Повертає об'єкт
   * @param isExist - чи існує таке місце на схемі залу
   * @param seatAttr - атрибути місця. Якщо місця не існує null
   */
  function getNextSeat(opt) {
    let isExist = false
    let seatAttr = null
    let $seat = null

    if (opt) {
      let {areaNumber, seatSequenceNumber, rowIndex, step} = {...opt}

      if (areaNumber && seatSequenceNumber && rowIndex && step) {
        seatSequenceNumber = +seatSequenceNumber + step
        $seat = getSeatOnSchemeByASNR({
          areaNumber,
          seatSequenceNumber,
          rowIndex
        })
    
        if ($seat) {
          seatAttr = getSeatAttr($seat)
          isExist = true
        }
      }
    }
         
    return {
      isExist,
      seatAttr,
      $seat
    }
  }


  function getSeatOnSchemeByASNR({areaNumber, seatSequenceNumber, rowIndex}) {
    return document.querySelector(
      `[${TICKET_ON_SCHEME}]` +
      `[${TICKET_SEAT_SEQUENCE_NUMBER_ATTR}="${seatSequenceNumber}"]` +
      `[${TICKET_AREA_NUMBER_ATTR}="${areaNumber}"]` +
      `[${TICKET_ROW_INDEX_ATTR}="${rowIndex}"]`
    )
  }  

}

// Social Distance



