const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Iyzipay = require('iyzipay');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// iyzico Bağlantı Ayarları (Render Environment Variables'dan otomatik çeker)
const iyzipay = new Iyzipay({
    apiKey: process.env.IYZI_API_KEY,
    secretKey: process.env.IYZI_SECRET_KEY,
    uri: process.env.IYZI_BASE_URL || 'https://api.iyzipay.com'
});

// Test Rotası
app.get('/', (req, res) => {
    res.send('Diesel Captan API ve İyzico Ödeme Sistemi Aktif Baskan!');
});

// 1. ÖDEMEYİ BAŞLATAN ROTA (Frontend buraya istek atar, iyzico formunu açar)
app.post('/initialize', (req, res) => {
    const { price, basketId, buyer, shippingAddress, billingAddress, basketItems } = req.body;

    const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: '123456789',
        price: price || '10.00', // Test için şimdilik 10 TL
        paidPrice: price || '10.00',
        currency: Iyzipay.CURRENCY.TRY,
        basketId: basketId || 'B67832',
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl: 'https://dieselcaptan-apia.onrender.com/payment-result', // Ödeme bitince iyzico'nun döneceği adres
        enabledInstallments: [1, 2, 3, 6, 9],
        buyer: buyer || {
            id: 'BY789',
            name: 'Test',
            surname: 'Kullanici',
            gsmNumber: '+905350000000',
            email: 'test@email.com',
            identityNumber: '74300864791',
            lastLoginDate: '2025-11-01 12:00:00',
            registrationDate: '2025-05-01 12:00:00',
            registrationAddress: 'Istanbul',
            ip: req.ip || '85.104.34.1',
            city: 'Istanbul',
            country: 'Turkey',
            zipCode: '34732'
        },
        shippingAddress: shippingAddress || {
            contactName: 'Test Kullanici',
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Merkez Mah. Sokak No:1',
            zipCode: '34732'
        },
        billingAddress: billingAddress || {
            contactName: 'Test Kullanici',
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Merkez Mah. Sokak No:1',
            zipCode: '34732'
        },
        basketItems: basketItems || [
            {
                id: 'BI101',
                name: 'Vakumlu Telefon Tutucu',
                category1: 'Oto Aksesuar',
                itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                price: price || '10.00'
            }
        ]
    };

    iyzipay.checkoutFormInitialize.create(request, (err, result) => {
        if (err) {
            console.error('iyzico başlatma hatası:', err);
            return res.status(500).json({ status: 'failure', errorMessage: err.message });
        }
        res.json(result);
    });
});

// 2. ÖDEME SONUCU / CALLBACK ROTA (İyzico ödeme bitince buraya veri gönderir)
app.post('/payment-result', (req, res) => {
    try {
        const paymentData = req.body;
        console.log('Yeni Sipariş / İyzico Callback Geldi:', JSON.stringify(paymentData, null, 2));

        const token = paymentData.token;
        if (token) {
            iyzipay.checkoutForm.retrieve({ token: token }, (err, result) => {
                if (err) {
                    console.error('Retrieve error:', err);
                    return res.status(500).send('Ödeme doğrulama hatası');
                }
                console.log('Onaylanan Ödeme Detayı:', result);
                // Ödeme başarılıysa müşteriyi kendi sitendeki başarı sayfasına yönlendirebilirsin
                res.redirect('https://dieselcaptanshop.com'); 
            });
        } else {
            res.status(200).send({ status: 'success', message: 'Ödeme alındı.' });
        }
    } catch (error) {
        console.error('İşlem hatası:', error);
        res.status(500).send({ status: 'error', message: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
