const express = Iyzipay = require('express'); // ya da senin mevcut iyzico/express importların
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
    connectionTimeout: 15000, // Bağlantı zaman aşımı süresi
    socketTimeout: 15000
});

// Test Rotası
app.get('/', (req, res) => {
    res.send('Diesel Captan API çalışıyor baskan!');
});

// İyzico Ödeme Sonucu / Callback Rotası
app.post('/payment-result', async (req, res) => {
    try {
        // İyzico'dan gelen veriler (Örnek yapı, senin iyzico callback içeriğine göre şekillenir)
        const paymentData = req.body;
        
        // Ödeme başarılı mı kontrolü (iyzico durumuna göre 'success' döner)
        // Burada kendi iyzico doğrulama mantığını çalıştırabilirsin.

        // Müşteri ve Sipariş Bilgilerini E-posta ile Gönderme
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'dieselcaptan@gmail.com',
            subject: '🚛 Yeni Sipariş Geldi, Baskan!',
            text: `Yeni bir sipariş başarıyla onaylandı ve ödeme alındı!\n\nSipariş Detayları:\n${JSON.stringify(paymentData, null, 2)}`
        };

        // Maili Gönder
        await transporter.sendMail(mailOptions);
        console.log('Sipariş maili başarıyla dieselcaptan@gmail.com adresine gönderildi.');

        res.status(200).send({ status: 'success', message: 'Ödeme alındı ve mail atıldı.' });
    } catch (error) {
        console.error('Mail atılırken hata:', error);
        res.status(500).send({ status: 'error', message: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
