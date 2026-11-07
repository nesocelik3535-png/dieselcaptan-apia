const Iyzipay = require('iyzipay');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const iyzipay = new Iyzipay({
        apiKey: process.env.IYZICO_API_KEY,
        secretKey: process.env.IYZICO_SECRET_KEY,
        uri: 'https://api.iyzipay.com'
    });

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
            name: 'Müşteri',
            surname: 'Adı',
            gsmNumber: '+905300000000',
            email: 'musteri@email.com',
            identityNumber: '11111111111',
            registrationAddress: 'Türkiye',
            ip: event.headers['client-ip'] || '85.105.0.1',
            city: 'Istanbul',
            country: 'Turkey'
        },
        shippingAddress: {
            contactName: 'Müşteri Adı',
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Teslimat Adresi',
            zipCode: '34000'
        },
        billingAddress: {
            contactName: 'Müşteri Adı',
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

    return new Promise((resolve) => {
        iyzipay.checkoutFormInitialize.create(request, (err, result) => {
            if (err) {
                resolve({
                    statusCode: 500,
                    body: JSON.stringify(err)
                });
            } else {
                resolve({
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(result)
                });
            }
        });
    });
};
