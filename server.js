const express = require('express');
const cors = require('cors');
const Iyzipay = require('iyzipay');

const app = express();
const PORT = process.env.PORT || 10000;

// TEST MODU: Deneme yaparken karttan yüksek tutar çekilmemesi için true bırak
const TEST_MODE_1_TL = true;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY || 'YOUR_API_KEY',
    secretKey: process.env.IYZICO_SECRET_KEY || 'YOUR_SECRET_KEY',
    uri: process.env.IYZICO_URI || 'https://api.iyzipay.com'
});

const pendingOrders = new Map();

app.get('/', (req, res) => {
    res.send('Diesel Captan API calisiyor');
});

app.post('/create-payment-form', (req, res) => {
    try {
        const { name, email, gsmNumber, address, price, quantity } = req.body || {};

        const cleanName = (name || 'Musteri Bilgisi').trim();
        const nameParts = cleanName.split(/\s+/);
        const surname = nameParts.length > 1 ? nameParts.pop() : 'Musteri';
        const firstName = nameParts.join(' ') || 'Musteri';

        const adet = Number(quantity) > 0 ? Number(quantity) : 1;
        const unitPrice = TEST_MODE_1_TL
            ? 1
            : (Number(price) > 0 ? Number(price) : 350);
        const totalPrice = (unitPrice * adet).toFixed(2);

        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: `ORDER_${Date.now()}`,
            price: totalPrice,
            paidPrice: totalPrice,
            currency: Iyzipay.CURRENCY.TRY,
            basketId: `B_${Date.now()}`,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            callbackUrl: 'https://dieselcaptan-apia.onrender.com/payment-result',
            enabledInstallments: [1, 2, 3, 6, 9],
            buyer: {
                id: `BY_${Date.now()}`,
                name: firstName,
                surname: surname,
                gsmNumber: gsmNumber || '+905000000000',
                email: email || 'siparis@dieselcaptanshop.com',
                identityNumber: '74300864791',
                lastLoginDate: '2026-11-25 12:00:00',
                registrationDate: '2026-06-01 12:00:00',
                registrationAddress: address || 'Adres Belirtilmedi',
                ip: req.ip || '85.104.34.1',
                city: 'Izmir',
                country: 'Turkey',
                zipCode: '35000'
            },
            shippingAddress: {
                contactName: cleanName,
                city: 'Izmir',
                country: 'Turkey',
                address: address || 'Adres Belirtilmedi',
                zipCode: '35000'
            },
            billingAddress: {
                contactName: cleanName,
                city: 'Izmir',
                country: 'Turkey',
                address: address || 'Adres Belirtilmedi',
                zipCode: '35000'
            },
            basketItems: [
                {
                    id: 'BI101',
                    name: `Katlanabilir Vakumlu Telefon Tutucu (${adet} Adet)`,
                    category1: 'Oto Aksesuar',
                    itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                    price: totalPrice
                }
            ]
        };

        iyzipay.checkoutFormInitialize.create(request, (err, result) => {
            if (err) {
                console.error('iyzico baslatma hatasi:', err);
                return res.status(500).json({ status: 'failure', errorMessage: err.message });
            }

            if (result && result.token) {
                pendingOrders.set(result.token, {
                    name: cleanName,
                    email: email || 'Belirtilmedi',
                    gsmNumber: gsmNumber || 'Belirtilmedi',
                    address: address || 'Belirtilmedi',
                    quantity: adet,
                    price: totalPrice,
                    createdAt: new Date().toISOString()
                });
            }

            return res.json(result);
        });
    } catch (error) {
        console.error('Form olusturma hatasi:', error);
        return res.status(500).json({ status: 'failure', errorMessage: error.message });
    }
});

app.post('/payment-result', (req, res) => {
    try {
        const paymentData = req.body || {};
        const token = paymentData.token;
        const savedOrder = token ? pendingOrders.get(token) : null;

        console.log('--- YENI ODEME BILDIRIMI GELDI ---');
        console.log('Callback Token:', token || 'YOK');

        if (!token) {
            console.log('UYARI: Token gelmedi. Gelen body:', JSON.stringify(paymentData));
            return res.redirect('https://dieselcaptanshop.com');
        }

        iyzipay.checkoutForm.retrieve({
            locale: Iyzipay.LOCALE.TR,
            token: token
        }, (err, result) => {
            if (err) {
                console.error('Retrieve hatasi:', err);
                return res.status(500).send('Odeme dogrulama hatasi');
            }

            const buyerFullName = (result && result.buyer && result.buyer.name)
                ? `${result.buyer.name} ${result.buyer.surname || ''}`.trim()
                : (savedOrder ? savedOrder.name : 'Bulunamadi');

            const buyerPhone = (result && result.buyer && result.buyer.gsmNumber)
                || (savedOrder ? savedOrder.gsmNumber : 'Bulunamadi');

            const buyerEmail = (result && result.buyer && result.buyer.email)
                || (savedOrder ? savedOrder.email : 'Bulunamadi');

            const shippingAddr = (result && result.shippingAddress && result.shippingAddress.address)
                || (savedOrder ? savedOrder.address : 'Bulunamadi');

            const shippingCity = (result && result.shippingAddress && result.shippingAddress.city)
                || 'Belirtilmedi';

            const itemsText = (result && Array.isArray(result.basketItems) && result.basketItems.length > 0)
                ? result.basketItems.map(item => `${item.name} (${item.price} TL)`).join(', ')
                : `Katlanabilir Vakumlu Telefon Tutucu (${savedOrder ? savedOrder.quantity : 1} Adet)`;

            console.log('================ MUSTERI VE SIPARIS BILGILERI ================');
            console.log('Odeme Durumu:', result ? result.paymentStatus : 'Bilinmiyor');
            console.log('Odenen Tutar:', (result && result.paidPrice) || (savedOrder ? savedOrder.price : 'Bilinmiyor'));
            console.log('Ad Soyad:', buyerFullName);
            console.log('Telefon:', buyerPhone);
            console.log('E-posta:', buyerEmail);
            console.log('Teslimat Adresi:', shippingAddr);
            console.log('Sehir:', shippingCity);
            console.log('Alinan Urunler:', itemsText);
            console.log('===========================================================');

            return res.redirect('https://dieselcaptanshop.com');
        });
    } catch (error) {
        console.error('Callback islem hatasi:', error);
        return res.status(500).send('Sunucu hatasi');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
