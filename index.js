const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AW2rSj9ThCjqZ7K_7Ym0HfmjXrdnWzQgRo6z-hY_9dRDsZyXucmGwMwMMs5Irt1EEjgUhxhI_JJ-Ffzq',
    'client_secret': 'EL35NLNP4HZw42aJEHeBUUpROTHeX8ZyXxU5T1G7219tATsI6YJHYfaiekxxWkL_9LiKIVYh7EhGgxQq'
  });

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));



// create a pay route
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
                }]
            },
            "amount": {
                "currency": "CAD",
                "total": "10.00"
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

            for(let i = 0; i < payment.links.length; i++) {
                if(payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
})

// success route
app.get('/success', (req, res) => {
    // get params from the URL that's sent back
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "CAD",
                "total": "10.00"
            }
        }]
    };

    
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

// cancel route
app.get('/cancel', (req, res) =>{
    res.send('Cancelled');
});



app.listen(3000, () => console.log("Server is running"));