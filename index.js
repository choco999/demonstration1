const express = require('express');
// import Paypal Rest SDK
const paypal = require('paypal-rest-sdk');

// paypal configuration
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AW2rSj9ThCjqZ7K_7Ym0HfmjXrdnWzQgRo6z-hY_9dRDsZyXucmGwMwMMs5Irt1EEjgUhxhI_JJ-Ffzq',
    'client_secret': 'EL35NLNP4HZw42aJEHeBUUpROTHeX8ZyXxU5T1G7219tATsI6YJHYfaiekxxWkL_9LiKIVYh7EhGgxQq'
  });

const app = express();

// for req.body undefined error
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// view engine setup
app.set('view engine', 'ejs');

// GET home
app.get('/', function(req, res, next) {
    res.render('index', {title: 'Group Tutorial - Paypal'});
});

// POST handler /pay
app.post('/pay', (req, res) => {
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Ice Cream",
                    "sku": "001",
                    "price": "10.00",
                    "currency": "CAD",
                    "quantity": 1
                    // class demo
                    // "name": req.body.name,
                    // "sku": "001",
                    // "price": req.body.price,
                    // "currency": "CAD",
                    // "quantity": req.body.quantity

                }]
            },
            "amount": {
                "currency": "CAD",
                "total" : "10.00"
                // class demo
                // "total": req.body.price * req.body.quantity
            },
            "description": "This is the payment description."
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            // console.log("Create Payment Response");
            // console.log(payment);
            // res.send('ok');

            // redirected to the success page
            for(let i = 0; i < payment.links.length; i++) {
                if(payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
})

// GET handler /success
app.get('/success', (req, res) => {
    // get params from the URL that's sent back
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId
    };

    //console.log(execute_payment_json.transactions[0]['amount']['total']) // 10.00

    
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
});

// GET handler /cancel
app.get('/cancel', (req, res) =>{
    res.send('Cancelled');
});



app.listen(3000, () => console.log("Server is running"));