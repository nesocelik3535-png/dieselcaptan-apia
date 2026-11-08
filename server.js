const express = require('express');
const Iyzipay = require('iyzipay');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true })); // iyzico callback form verilerini okumak için şart

// iyzico Ayarları
const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: 'https://api.iyzipay.com'
});

// E-Posta Gönderici (Nodemailer) Ayarı
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. Adım: Ödeme Formunu Başlatma İstekte Bulunma
app.post('/create-payment-form', (req, res) => {
    const { name, email, gsmNumber, address, price, quantity } = req.body;

    const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: '123456789',
        price: price,
        paidPrice: price,
        currency: Iyzipay.CURRENCY.TL,
        basketId: 'B67832',
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        // Ödeme bittikten sonra iyzico'nun döneceği adres (Render sunucumuzdaki callback adresi)
        callbackUrl: 'https://dieselcaptan-apia.onrender.com/payment-result',
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
                price: price
            }
        ]
    };

    iyzipay.checkoutFormInitialize.create(request, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

// 2. Adım: Ödeme Bittikten Sonra iyzico'nun Tetikleyeceği Callback (Sonuç) Yolu
app.post('/payment-result', async (req, res) => {
    const token = req.body.token;

    const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: '123456789',
        token: token
    };

    // Ödemenin gerçekten başarılı olup olmadığını iyzico'dan sorguluyoruz
    iyzipay.checkoutForm.retrieve(request, async (err, result) => {
        if (err || result.paymentStatus !== 'SUCCESS') {
            console.error('Ödeme başarısız veya hata oluştu:', err || result);
            return res.send('<h3>Ödeme başarısız oldu veya iptal edildi. Lütfen tekrar deneyin.</h3>');
        }

        // --- BURAYA GİRDİYSE ÖDEME %100 BAŞARILIDIR BARKAN! ---
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER, // Senin mail adresine düşecek
                subject: `💰 PARA YATTI! Yeni Onaylanmış Sipariş Var!`,
                text: `Harika haber baskan! Müşteri ödemeyi başarıyla tamamladı.\n\n` +
                      `Ödenen Tutar: ${result.paidPrice} TL\n` +
                      `İşlem ID: ${result.paymentId}\n` +
                      `Müşteri E-posta: ${result.buyer ? result.buyer.email : 'Belirtilmemiş'}\n` +
                      `Teslimat Adresi: ${result.shippingAddress ? result.shippingAddress.address : 'Belirtilmemiş'}\n\n` +
                      `Kargoyu hazırlamaya başlayabilirsin baskan, hayırlı olsun!`
            };

            await transporter.sendMail(mailOptions);
            console.log('Başarılı ödeme maili gönderildi.');
        } catch (mailError) {
            console.error('Mail atılırken hata:', mailError);
        }

        // Müşteriye gösterilecek başarı sayfası (Teşekkürler ekranı)
        res.send(`
            <div style="text-align:center; padding:50px; background:#0b0f19; color:#fff; font-family:sans-serif;">
                <h1 style="color:#2ed573;">🎉 Ödemeniz Başarıyla Alındı!</h1>
                <p style="font-size:18px; margin-top:15px;">Siparişiniz başarıyla oluşturuldu. En kısa sürede kargoya verilecektir.</p>
                <p style="color:#aaa; margin-top:20px;">Diesel Captan Shop'u tercih ettiğiniz için teşekkür ederiz.</p>
                <a href="https://dieselcaptanshop.com" style="display:inline-block; margin-top:30px; padding:12px 25px; background:#ff6600; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">Ana Sayfaya Dön</a>
            </div>
        `);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
