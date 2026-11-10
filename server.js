const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test Rotası
app.get('/', (req, res) => {
    res.send('Diesel Captan API ve Ödeme Sistemi Aktif Baskan!');
});

// İyzico Ödeme Sonucu / Callback Rotası
app.post('/payment-result', (req, res) => {
    try {
        const paymentData = req.body;
        console.log('Yeni Sipariş Geldi / İyzico Callback Data:', JSON.stringify(paymentData, null, 2));

        // Ödeme başarılı şekilde iyzico tarafından işlendi, cevabı dönüyoruz.
        res.status(200).send({ status: 'success', message: 'Ödeme başarıyla alındı.' });
    } catch (error) {
        console.error('İşlem hatası:', error);
        res.status(500).send({ status: 'error', message: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
