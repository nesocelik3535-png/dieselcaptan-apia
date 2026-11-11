const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Iyzipay = require('iyzipay');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// iyzico Bağlantı Ayarları (Canlı Anahtarların)
const iyzipay = new Iyzipay({
    apiKey: 'WDAOSN8QAcnhXv8AB4U2LCgs4bHreWF4',
    secretKey: 'kCon8WH5MfjngXaaZHiNdD0xNKyiMMyU',
    uri: 'https://api.iyzipay.com'
});

// Test Rotası
app.get('/', (req, res) => {
    res.send('Diesel Captan API ve İyzico Ödeme Sistemi Aktif Baskan!');
});

// 1. Ödemeyi Başlatan Rota (Sitenin beklediği /create-payment-form adresi)
app.post('/create-payment-form', (req, res) => {
    const { name, email, gsmNumber, address, price, quantity } = req.body;

    // Ad soyad parçalama (iyzico name ve surname ayrı ister)
    const nameParts = (name || 'Test Kullanici').trim().split(' ');
    const surname = nameParts.length > 1 ? nameParts.pop() : 'Kullanici';
    const firstName = nameParts.join(' ') || 'Test';

    const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: '123456789',
        price: price || '350.00',
        paidPrice: price || '350.00',
        currency: Iyzipay.CURRENCY.TRY,
        basketId: 'B67832',
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl: 'https://dieselcaptan-apia.onrender.com/payment-result',
        enabledInstallments: [1, 2, 3, 6, 9],
        buyer: {
            id: 'BY789',
            name: firstName,
            surname: surname,
            gsmNumber: gsmNumber || '+905350000000',
            email: email || 'test@email.com',
            identityNumber: '74300864791',
            lastLoginDate: '2026-11-10 12:00:00',
            registrationDate: '2026-05-01 12:00:00',
            registrationAddress: address || 'Istanbul',
            ip: req.ip || '85.104.34.1',
            city: 'Istanbul',
            country: 'Turkey',
            zipCode: '34732'
        },
        shippingAddress: {
            contactName: name || 'Test Kullanici',
            city: 'Istanbul',
            country: 'Turkey',
            address: address || 'Merkez Mah. Sokak No:1',
            zipCode: '34732'
        },
        billingAddress: {
            contactName: name || 'Test Kullanici',
            city: 'Istanbul',
            country: 'Turkey',
            address: address || 'Merkez Mah. Sokak No:1',
            zipCode: '34732'
        },
        basketItems: [
            {
                id: 'BI101',
                name: `Katlanabilir Vakumlu Telefon Tutucu (${quantity || 1} Adet)`,
                category1: 'Oto Aksesuar',
                itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                price: price || '350.00'
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

// 2. Ödeme Sonucu / Callback Rota (Müşteri bilgileri burada yakalanıyor)
app.post('/payment-result', (req, res) => {
    try {
        const paymentData = req.body;
        console.log('--- YENİ ÖDEME BİLDİRİMİ GELDİ ---');

        const token = paymentData.token;
        if (token) {
            iyzipay.checkoutForm.retrieve({ token: token }, (err, result) => {
                if (err) {
                    console.error('Retrieve error:', err);
                    return res.status(500).send('Ödeme doğrulama hatası');
                }
                
                // Müşteri ve sipariş detaylarını Render loglarına devasa ve net şekilde basıyoruz
                console.log('================ MÜŞTERİ VE SİPARİŞ BİLGİLERİ ================');
                console.log('Ödeme Durumu:', result.paymentStatus);
                console.log('Ödenen Tutar:', result.paidPrice);
                console.log('Ad Soyad:', result.buyer ? (result.buyer.name + ' ' + result.buyer.surname) : 'Bulunamadı');
                console.log('Telefon:', result.buyer ? result.buyer.gsmNumber : 'Bulunamadı');
                console.log('E-posta:', result.buyer ? result.buyer.email : 'Bulunamadı');
                console.log('Teslimat Adresi:', result.shippingAddress ? result.shippingAddress.address : 'Bulunamadı');
                console.log('Şehir:', result.shippingAddress ? result.shippingAddress.city : 'Bulunamadı');
                console.log('Alınan Ürünler:', JSON.stringify(result.basketItems));
                console.log('===========================================================');

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
