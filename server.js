const express = require('express');
const Iyzipay = require('iyzipay');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,WDAOSN8QAcnhXv8AB4U2LCgs4bHreWF4
    secretKey: process.env.IYZICO_SECRET_KEY,kCon8WH5MfjngXaaZHiNdD0xNKyiMMyU
    uri: 'https://api.iyzipay.com'
});

app.post('/create-payment-form', (req, res) => {
    const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: '123456789',
        price: '299.00',
        paidPrice: '299.00',
        currency: Iyzipay.CURRENCY.TL,
        basketId: 'B67832',
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl: 'https://dieselcaptanshop.com/payment-callback',
        enabledInstallments: [1, 2, 3, 6, 9],
        buyer: {
            id: 'BY789',
            name: 'Musteri',
            surname: 'Musteri',
            gsmNumber: '+905300000000',
            email: 'musteri@email.com',
            identityNumber: '11111111111',
            registrationAddress: 'Turkiye',
            ip: req.ip || '85.105.0.1',
            city: 'Istanbul',
            country: 'Turkey'
        },
        shippingAddress: {
            contactName: 'Musteri',
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Teslimat Adresi',
            zipCode: '34000'
        },
        billingAddress: {
            contactName: 'Musteri',
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Fatura Adresi',
            zipCode: '34000'
        },
        basketItems: [
            {
                id: 'BI101',
                name: 'Vakumlu Telefon Tutucu',
                category1: 'Aksesuar',
                itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                price: '299.00'
            }
        ]
    };

    iyzipay.checkoutFormInitialize.create(request, (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json(result);
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
