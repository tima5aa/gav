let CI_USER_NAME  = 'ci_user_name'
let CI_USER_EMAIL = 'ci_user_email'
let CI_USER_PHONE = 'ci_user_phone'

let conf = {
  cookieName: {
    userName : "UserNameWidget",
    userEmail: "UserEmailWidget",
    userPhone: "UserPhoneWidget"  
  }
}

function setCookieIntoUserFields(){
  if(getCookieByName(conf.cookieName.userName))  {
    document.getElementById(CI_USER_NAME).value  = getCookieByName(conf.cookieName.userName); 
  }
  if(getCookieByName(conf.cookieName.userEmail)) {
    document.getElementById(CI_USER_EMAIL).value = getCookieByName(conf.cookieName.userEmail);
  }
	if(getCookieByName(conf.cookieName.userPhone)) {
		let phoneStr = getCookieByName(conf.cookieName.userPhone).replace(/\s+/g, '');
		document.getElementById(CI_USER_PHONE).value = phoneStr;
		updateMaskPhone(phoneStr);		
	}
}







function getCookieByName(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function saveUserInfoIntoCookies(){
	let userInfo = getUserInfo();
	setCookie(conf.cookieName.userName,  userInfo.name);
	setCookie(conf.cookieName.userEmail, userInfo.email);
	setCookie(conf.cookieName.userPhone, userInfo.phone);	
}

function setCookie(name, value, days = 30) {
	let expire = 86400 * days;
	let expireToDate = new Date();
	expireToDate.setTime(new Date().getTime() + expire * 1000);	
	let cookieStr = encodeURIComponent(name) + "=" + encodeURIComponent(value) + "; path=/; Max-Age=" + expire + "; Expires=" + expireToDate.toUTCString();
	document.cookie = cookieStr;
}

// Вирішили не використовувати функціонал маски для телефону
function updateMaskPhone(phone){
  return
}



/*
По масці дійсно є проблеми

Проблематика:
По нашому ТЗ
телефони можуть вводитись у форматах
040 555 66 77        -  на сервер відправляється 38 040 555 66 77
8 040 555 66 77     -  на сервер відправляється 38 040 555 66 77
38 040 555 66 77   -  на сервер відправляється 38 040 555 66 77

відпоповідно в залежності від довжини телефона без маски, - ми змушені були міняти саму маску
0405556677  -> mask: '00 000 00 00'
80405556677  -> mask: '000 000 00 00'
380405556677  -> mask: '00 000 000 00 00'

міняти маску - озанчає перестворювати або апдейтити. В такому випадку курсор стрибає у кінець рядка. Що не зовсім приємно коли хочеш змінити цифру в середині номеру. Тоді починаєш гратися з курсором. Виставляти запам'ятовувати, а потім враховуючи вже нову маску зміщати на +1, -1 (якщо передує пробіл) і  т.п..
В результаті логіка звичайного інпута - виходить не така вже й тривіальна. Що вимагає час на продумування, розробку та тестування.

Тому на зараз я залишив 
'00 000 000 00 00'

в той же час, якщо ввести
040 555 66 77        -  на сервер відправляється 38 040 555 66 77
8 040 555 66 77     -  на сервер відправляється 38 040 555 66 77
38 040 555 66 77   -  на сервер відправляється 38 040 555 66 77


Нотатка:
У разі складної реалізацї, при зміні маски 
mask: '00 000 00 00'    ->     mask: '000 000 00 00'     ->    mask: '00 000 000 00 00' 

та ін варіаціях
при редагування в середині номеру,  у покупця буде візуальний зсув позиції

'000 000 00 00'    ->  Del   ->  '00 000 00 00'
*/




// редагування в середині номеру викликає проблеми
// function updateMaskPhone_v0(value){
//   var selector = document.getElementById(CI_USER_PHONE);
//   let m = '00 000 000 00 00'
//   if (value.length < 10){
//     m = '00 000 00 00'
//     var maskOptions = { mask: m }
//   }		
//   if (value.length === 10){
//     m = '000 000 00 00'
//     var maskOptions = { mask: m }
//   } 
//   if (value.length > 10){
//     m = '00 000 000 00 00'
//     var maskOptions = { mask: m }
//   }
//   let mask = IMask(selector, maskOptions);
//   mask.destroy();
//   mask.updateOptions({ mask: m })	
// }


// let mask = {}
// function setPhoneMask(){
//   let selector = document.getElementById(CI_USER_PHONE);
//   mask = IMask(selector, { mask: '00 000 00 00' });
// }
// function updateMaskPhone(phone){
//   let                       maskOptions = { mask: '00 000 00 00'      } //phone.length < 10
//   if (phone.length === 10)  maskOptions = { mask: '000 000 00 00'     }
//   if (phone.length > 10)    maskOptions = { mask: '00 000 000 00 00'  } 
//   mask.destroy() 
//   mask.updateOptions(maskOptions)
// }


// напівробочий варіант з перестрибуаванням курсора в правильну позицію
// якщо редагувати число, після якого є ще одне число - тоді курсор займає не правильну позицію
// проте мені здається так не зручно. Маска змінюється і візульано курсор не там де "зафіксувало око"
/*
function updateMaskPhone_notCorrectWork(phone){
  let selector = document.getElementById(CI_USER_PHONE);
  let cursorPosS = selector.selectionStart
  let cursorPosE = selector.selectionEnd

  if (phone.length < 10) {
    maskOptions = { mask: '00 000 00 00' }
    let mask = IMask(selector, maskOptions);
    mask.destroy();
    mask.updateOptions(maskOptions)	

    if (cursorPosS === 3) {
      cursorPosS++
      cursorPosE++
    }
    if (cursorPosS === 7) {
      cursorPosS++
      cursorPosE++
    }  
    if (cursorPosS === 10) {
      cursorPosS++
      cursorPosE++
    }        
  }
  if (phone.length === 10)  {
    maskOptions = { mask: '000 000 00 00' }
    let mask = IMask(selector, maskOptions);
    mask.destroy();
    mask.updateOptions(maskOptions)	

    if (cursorPosS === 5) {
      cursorPosS++
      cursorPosE++
    }     
    if (cursorPosS === 8) {
      cursorPosS++
      cursorPosE++
    }     
    if (cursorPosS === 11) {
      cursorPosS++
      cursorPosE++
    }     
  }
  if (phone.length > 10) {
    maskOptions = { mask: '00 000 000 00 00' }
    let mask = IMask(selector, maskOptions);
    mask.destroy();
    mask.updateOptions(maskOptions)

    if (cursorPosS === 3) {
      cursorPosS++
      cursorPosE++
    }    	
    if (cursorPosS === 7) {
      cursorPosS++
      cursorPosE++
    }    	
    if (cursorPosS === 11) {
      cursorPosS++
      cursorPosE++
    }    	
    if (cursorPosS === 14) {
      cursorPosS++
      cursorPosE++
    }    	
  }
	
  selector.selectionStart = cursorPosS
  selector.selectionEnd = cursorPosE
}
*/