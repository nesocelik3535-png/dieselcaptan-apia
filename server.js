const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Nodemailer Transporter Ayarı (Render ETIMEDOUT / Zaman Aşımı Çözümlü)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // 587 portu için false olmalı
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    socketTimeout: 15000
});

// Test Rotası
app.get('/', (req, res) => {
    res.send('Diesel Captan API çalışıyor baskan!');
});

// İyzico Ödeme Sonucu / Callback Rotası
app.post('/payment-result', async (req, res) => {
    try {
        const paymentData = req.body;
        
        // Müşteri mail adresini iyzico/istek verisinden yakalıyoruz
        const customerEmail = paymentData.email || paymentData.buyer?.email;

        // 1. SANA (SATICIYA) GİDECEK BİLDİRİM MAİLİ
        const sellerMailOptions = {
            from: process.env.EMAIL_USER,
            to: 'dieselcaptan@gmail.com',
            subject: '🚛 Yeni Sipariş Geldi, Baskan!',
            text: `Yeni bir sipariş başarıyla onaylandı ve ödeme alındı!\n\nSipariş Detayları:\n${JSON.stringify(paymentData, null, 2)}`
        };
        await transporter.sendMail(sellerMailOptions);
        console.log('Sipariş maili başarıyla dieselcaptan@gmail.com adresine gönderildi.');

        // 2. MÜŞTERİYE GİDECEK ONAY MAİLİ
        if (customerEmail) {
            const customerMailOptions = {
                from: process.env.EMAIL_USER,
                to: customerEmail,
                subject: 'Siparişiniz Alındı - Diesel Captan',
                text: `Merhaba,\n\nSiparişiniz başarıyla alındı ve ödemeniz onaylandı! En kısa sürede kargo hazırlıklarına başlayıp seni bilgilendireceğiz.\n\nBizi tercih ettiğin için teşekkür ederiz baskan!`
            };
            await transporter.sendMail(customerMailOptions);
            console.log(`Müşteriye (${customerEmail}) başarıyla onay maili gönderildi.`);
        }

        res.status(200).send({ status: 'success', message: 'Ödeme alındı ve mailler atıldı.' });
    } catch (error) {
        console.error('Mail atılırken hata:', error);
        res.status(500).send({ status: 'error', message: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
