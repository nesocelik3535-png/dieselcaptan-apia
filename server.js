const express = require('express');
const Iyzipay = require('iyzipay');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: 'https://api.iyzipay.com'
});

app.post('/create-payment-form', (req, res) => {
    // Siteden gelen dinamik fiyat, adet ve müşteri bilgilerini alıyoruz
    const { name, email, gsmNumber, address, price, quantity } = req.body;

    const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: '123456789',
        price: price,           // <-- Siteden seçilen fiyat (350 veya 600)
        paidPrice: price,       // <-- Ödenecek net tutar
        currency: Iyzipay.CURRENCY.TL,
        basketId: 'B67832',
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl: 'https://dieselcaptanshop.com/payment-callback',
        enabledInstallments: [1, 2, 3, 6, 9],
        buyer: {
            id: 'BY789',
            name: name || 'Müşteri',
            surname: 'Şoför',
            gsmNumber: gsmNumber || '+905300000000',
            email: email || 'musteri@email.com',
            identityNumber: '11111111111',
            registrationAddress: address || 'Türkiye',
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || '85.105.0.1',
            city: 'Izmir',
            country: 'Turkey'
        },
        shippingAddress: {
            contactName: name || 'Müşteri',
            city: 'Izmir',
            country: 'Turkey',
            address: address || 'Teslimat Adresi',
            zipCode: '35000'
        },
        billingAddress: {
            contactName: name || 'Müşteri',
            city: 'Izmir',
            country: 'Turkey',
            address: address || 'Fatura Adresi',
            zipCode: '35000'
        },
        basketItems: [
            {
                id: 'BI101',
                name: `Katlanabilir Vakumlu Telefon Tutucu (${quantity || 1} Adet)`,
                category1: 'Aksesuar',
                itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                price: price     // <-- Sepetteki ürün fiyatı da dinamik gidiyor
            }
        ]
    };

    iyzipay.checkoutFormInitialize.create(request, (err, result) => {
        if (err) {
            console.error(err);
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
