/**
 * will run on the front,not running on nodejs server
 * this file will be imported by views/shop/checkout.hbs
 * see more from https://stripe.com/docs/stripe-js/v2
 * 
 * The following Stripe variables can be used, because all the elements in the checkout.hbs 
 * page has been introduced
 */

/**
 * setPublishableKey is required because when stripe validates the credit card data and 
 * encrypted with setPublishableKey
 * it will give us a back token if the data is valid,this token will basically hold the credit 
 * card data,the server will be able decrypt the information with nava key or private key
 */

Stripe.setPublishableKey('pk_test_WJEfAcprr2NORh2oFnJkie5F');

var $form = $('#checkout-form');

/**
 * add a listener making sure that this method gets executed whenever submit the form
 */
$form.submit(function(event) {
    $('#charge-error').addClass('d-none');
    /**
     * just a submit button
     * 
     * set button disabled that user can't submit the button multiple time whilevalidation is
     * going on
     */
    $form.find('button').prop('disabled', true);
    /**
     * function ship will shipping with stripe SDK
     */
    Stripe.card.createToken({
        number: $('#card-number').val(),
        cvc: $('#card-cvc').val(),
        exp_month: $('#card-expiry-month').val(),
        exp_year: $('#card-expiry-year').val(),
        name: $('#card-name').val()
    }, stripeResponseHandler);
    /**
     * the form submission which is triggered when click the button then this form submission
     * will stopped,doesn't actually send a validation request to server yet
     */
    return false;
});

/**
 * 
 * @param {*} status 
 * @param {*} response 
 */
function stripeResponseHandler(status, response) {
    /**
     * Problem!credit card data is invalid
     */
    if (response.error) {
        // Show the errors on the form,not use form-find because the id charge-error in outside the form
        $('#charge-error').text(response.error.message);
        // Show when error occurred
        $('#charge-error').removeClass('d-none');
        /** user fixed the errors then Re-enable submission
         * because will want to use the button which in form to execute the instruction
         */
        $form.find('button').prop('disabled', false);
    } else { // Token was created!

        // Get the token ID:
        var token = response.id;

        /** Insert the token which holds the encrypted credit card information into the form 
         * so it gets submitted to the server:
         */
        $form.append($('<input type="hidden" name="stripeToken" />').val(token));

        // Submit the form:
        $form.get(0).submit();
    }
}