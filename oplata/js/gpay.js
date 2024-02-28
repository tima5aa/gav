/**
 * Define the version of the Google Pay API referenced when creating your
 * configuration
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#PaymentDataRequest|apiVersion in PaymentDataRequest}
 */
let baseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0
};

/**
 * Card networks supported by your site and your gateway
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#CardParameters|CardParameters}
 * @todo confirm card networks supported by your site and gateway
 */
let allowedCardNetworks = ["MASTERCARD", "VISA"];


/**
 * Card authentication methods supported by your site and your gateway
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#CardParameters|CardParameters}
 * @todo confirm your processor supports Android device tokens for your
 * supported card networks
 */
let allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];


/**
 * Identify your gateway and your site's gateway merchant identifier
 *
 * The Google Pay API response will return an encrypted payment method capable
 * of being charged by a supported gateway after payer authorization
 *
 * @todo check with your gateway on the parameters to pass
 * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#gateway|PaymentMethodTokenizationSpecification}
 */
let tokenizationSpecification = {
  type: 'PAYMENT_GATEWAY',
  parameters: {
    'gateway': '',
    'gatewayMerchantId': ''
  }
};

/**
 * Describe your site's support for the CARD payment method and its required
 * fields
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#CardParameters|CardParameters}
 */
let baseCardPaymentMethod = {
  type: 'CARD',
  parameters: {
    allowedAuthMethods: allowedCardAuthMethods,
    allowedCardNetworks: allowedCardNetworks
  }
};

/**
 * Describe your site's support for the CARD payment method including optional
 * fields
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#CardParameters|CardParameters}
 */
let cardPaymentMethod = Object.assign(
  {},
  baseCardPaymentMethod,
  {
    tokenizationSpecification: tokenizationSpecification
  }
);

/**
 * An initialized google.payments.api.PaymentsClient object or null if not yet set
 *
 * @see {@link getGooglePaymentsClient}
 */
let paymentsClient = null;

/**
 * Configure your site's support for payment methods supported by the Google Pay
 * API.
 *
 * Each member of allowedPaymentMethods should contain only the required fields,
 * allowing reuse of this base request when determining a viewer's ability
 * to pay and later requesting a supported payment method
 *
 * @returns {object} Google Pay API version, payment methods supported by the site
 */
function getGoogleIsReadyToPayRequest() {
  return Object.assign(
    {},
    baseRequest,
    {
      allowedPaymentMethods: [baseCardPaymentMethod]
    }
  );
}

/**
 * Configure support for the Google Pay API
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#PaymentDataRequest|PaymentDataRequest}
 * @returns {object} PaymentDataRequest fields
 */
function getGooglePaymentDataRequest() {
  const paymentDataRequest = Object.assign({}, baseRequest);
  paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];
  paymentDataRequest.transactionInfo = getGoogleTransactionInfo();
  paymentDataRequest.merchantInfo = data.PayDef.merchantInfo;
  return paymentDataRequest;
}

/**
 * Return an active PaymentsClient or initialize
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/client#PaymentsClient|PaymentsClient constructor}
 * @returns {google.payments.api.PaymentsClient} Google Pay API client
 */
function getGooglePaymentsClient() {
  if (paymentsClient === null) {
    // paymentsClient = new google.payments.api.PaymentsClient({environment: 'TEST'});
    paymentsClient = new google.payments.api.PaymentsClient({ environment: 'PRODUCTION' });
    // paymentsClient = new google.payments.api.PaymentsClient({ environment: data.PayDef.environment });
  }
  return paymentsClient;
}


let WrapGpayFromGoogleInit = undefined
function initedGpayButton() {
  if (WrapGpayFromGoogleInit) {
    return WrapGpayFromGoogleInit.querySelector('button')
  }

  return undefined
}

/**
 * Initialize Google PaymentsClient after Google-hosted JavaScript has loaded
 *
 * Display a Google Pay payment button after confirmation of the viewer's
 * ability to pay.
 */
function onGooglePayLoaded() {
  const paymentsClient = getGooglePaymentsClient();
  plugGpay.removeAnimationLoading()
  paymentsClient.isReadyToPay(getGoogleIsReadyToPayRequest())
    .then(function (response) {
      if (response.result) {
        addGooglePayButton();
        if (initedGpayButton()) {
          initedGpayButton().classList.add('hide')
        }
        plugGpay.setText('натисніть "Продовжити"')
        plugGpay._$root.querySelector('.wrap-logo-text').classList.add('full-size')
        // @todo prefetch payment data to improve performance after confirming site functionality
        // prefetchGooglePaymentData();
      }
    })
    .catch(function (err) {
      // show error in developer console for debugging: console.error(err)
      console.error(err);
      plugGpay.setText('помилка ініцілізації')
    })
}


/**
 * Add a Google Pay purchase button alongside an existing checkout button
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#ButtonOptions|Button options}
 * @see {@link https://developers.google.com/pay/api/web/guides/brand-guidelines|Google Pay brand guidelines}
 */
function addGooglePayButton() {
  const paymentsClient = getGooglePaymentsClient();
  WrapGpayFromGoogleInit =
    paymentsClient.createButton({
      buttonColor: 'default',
      buttonType: 'checkout',
      buttonLocale: 'uk',
      onClick: onGooglePaymentButtonClicked
    });
  // paymentsClient.createButton({onClick: processPaymentData});
  document.getElementById('container-gpay-btn').appendChild(WrapGpayFromGoogleInit);
}

/**
 * Provide Google Pay API with a payment amount, currency, and amount status
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#TransactionInfo|TransactionInfo}
 * @returns {object} transaction info, suitable for use as transactionInfo property of PaymentDataRequest
 */
function getGoogleTransactionInfo() {
  return data.PayDef.transactionInfo;
}

/**
 * Prefetch payment data to improve performance
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/client#prefetchPaymentData|prefetchPaymentData()}
 */

function prefetchGooglePaymentData() {
  const paymentDataRequest = getGooglePaymentDataRequest();
  // transactionInfo must be set but does not affect cache
  paymentDataRequest.transactionInfo = {
    totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
    currencyCode: data.PayDef.transactionInfo.currencyCode
  };
  const paymentsClient = getGooglePaymentsClient();
  paymentsClient.prefetchPaymentData(paymentDataRequest);
}

/**
 * Show Google Pay payment sheet when Google Pay payment button is clicked
 */
function onGooglePaymentButtonClicked() {

  if (!isAllFieldAndAgreementSet()) {
    return
  }

  const paymentDataRequest = getGooglePaymentDataRequest();
  paymentDataRequest.transactionInfo = getGoogleTransactionInfo();

  const paymentsClient = getGooglePaymentsClient();
  paymentsClient.loadPaymentData(paymentDataRequest)
    .then(function (paymentData) {
      // handle the response
      processPayment(paymentData);
    })
    .catch(function (err) {
      // show error in developer console for debugging
      // console.error(err);
    });
}

/**
 * Process payment data returned by the Google Pay API
 *
 * @param {object} paymentData response from Google Pay API after user approves payment
 * @see {@link https://developers.google.com/pay/api/web/reference/response-objects#PaymentData|PaymentData object reference}
 */
function processPayment(paymentData) {
  // show returned data in developer console for debugging
  // console.log(paymentData);

  // @todo pass payment token to your gateway to process payment
  paymentToken = paymentData.paymentMethodData.tokenizationData.token;

  let url = data.uri
  let d =
  {
    "email": getUserInfo().email,
    "data": paymentData,
  }
  sendWebRequest(d, url, true).then(data => {
    if (data.status === 2) {
      hidePreloadAnim()
      window.location.href = 'tickets'
    }
  })


}


let data = {}

function initGPay(mxData) {
  data = mxData

  allowedCardNetworks = data.PayDef.allowedPaymentMethods[0].parameters.allowedCardNetworks
  allowedCardAuthMethods = data.PayDef.allowedPaymentMethods[0].parameters.allowedAuthMethods
  tokenizationSpecification = data.PayDef.allowedPaymentMethods[0].tokenizationSpecification

  baseRequest = {
    apiVersion: data.PayDef.apiVersion,
    apiVersionMinor: data.PayDef.apiVersionMinor
  }

  baseCardPaymentMethod = {
    type: data.PayDef.allowedPaymentMethods[0].type,
    parameters: data.PayDef.allowedPaymentMethods[0].parameters,
  }

  cardPaymentMethod = Object.assign(
    {},
    baseCardPaymentMethod,
    {
      tokenizationSpecification: tokenizationSpecification
    }
  )

  paymentsClient = new google.payments.api.PaymentsClient({ environment: data.PayDef.environment });

}
