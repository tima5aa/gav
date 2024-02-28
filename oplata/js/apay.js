document.addEventListener('DOMContentLoaded', () => {
	if (window.ApplePaySession) {
		if (ApplePaySession.canMakePaymentsWithActiveCard('merchant.com.multiplex')) {
			document.querySelector('[data-payment-type="applepay"]').classList.remove('hide')
			showApplePayButton();
		}
	}
});

function showApplePayButton() {

	HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
	let buttons = document.getElementsByClassName("apple-pay-button");
	for (let button of buttons) {
		button.className += " visible";
		button.addEventListener('click', () => {

			if (!isAllFieldAndAgreementSet()) {
				return
			}

			let amount = (getCartTicketsSum() + getCartConsSum()).toString() + '.00'

			let paymentRequest = {
				countryCode: 'UA',
				currencyCode: 'UAH',
				total: {
					label: 'Multiplex',
					type: 'final',
					amount: amount
				},
				supportedNetworks: ['masterCard', 'visa'],
				merchantCapabilities: ['supports3DS']
			};

			let session = new ApplePaySession(2, paymentRequest);

			session.onvalidatemerchant = (event) => {
				let validationURL = event.validationURL;
				let body = Object.assign({ payType: 'applepay', validationURL: validationURL }, getUserInfo());
				let uri = `/cart/${getUserSessionId()}/checkout`;

				sendWebRequest(body, uri, false)
					.then(response => {
						session.completeMerchantValidation(response.PayDef);
					})
					.catch(e => {})
			};


			session.onpaymentauthorized = (event) => {
				let payment = event.payment;
				let body = Object.assign({ token: payment.token }, getUserInfo());
				let uri = `/cart/${getUserSessionId()}/client_apple`;

				sendWebRequest(body, uri, false)
					.then(response => {
						// session.completePayment(ApplePaySession.STATUS_SUCCESS);
						// if (
						// 	'details' in response
						// 	&& 'ticket_status' in response.details
						// 	&& response.details.ticket_status === 2
						// ) {
						// 	hidePreloadAnim()
						// 	window.location.href = 'tickets'
						// }

						let backEndRespPayment = {
							mxResp: response
						}
						moveToTicketsPage(backEndRespPayment)


					})
					.catch(e => {
						session.completePayment(ApplePaySession.STATUS_FAILURE);
					})
			};

			session.begin();

		}, false)
	}
}
