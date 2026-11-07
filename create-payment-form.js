app.post('/create-payment-form', async (req, res) => {
    try {
        // Önden gelen fiyatı (349.99 veya 600.00) ve adet bilgisini alıyoruz
        const { name, email, gsmNumber, address, price, quantity } = req.body;

        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: '123456789',
            price: price,         // Sabit 299 yerine artık siteden seçilen fiyat gidiyor!
            paidPrice: price,     // Ödenecek tutar
            currency: Iyzipay.CURRENCY.TRY,
            basketId: 'B67832',
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            callbackUrl: 'https://dieselcaptan-apis.onrender.com/payment-result',
            buyer: {
                id: 'BY789',
                name: name || 'Değerli Müşterimiz',
                surname: 'Şoför',
                gsmNumber: gsmNumber || '+905555555555',
                email: email || 'bilgi@dieselcaptan.com',
                identityNumber: '74300864791',
                lastLoginDate: '2026-05-01 12:00:00',
                registrationDate: '2026-05-01 12:00:00',
                registrationAddress: address || 'Türkiye',
                ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                city: 'Izmir',
                country: 'Turkey',
                zipCode: '35000'
            },
            shippingAddress: {
                contactName: name || 'Müşteri',
                city: 'Izmir',
                country: 'Turkey',
                address: address || 'Türkiye',
                zipCode: '35000'
            },
            billingAddress: {
                contactName: name || 'Müşteri',
                city: 'Izmir',
                country: 'Turkey',
                address: address || 'Türkiye',
                zipCode: '35000'
            },
            basketItems: [
                {
                    id: 'BI101',
                    name: `Katlanabilir Vakumlu Telefon Tutucu (${quantity} Adet)`,
                    category1: 'Oto Aksesuar',
                    itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                    price: price
                }
            ]
        };

        iyzipay.checkoutFormInitialize.create(request, function (err, result) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Ödeme hatası' });
            }
            res.json(result);
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});
```[cite: 1, 2, 3]

---

### 2. Bölüm: Netlify `index.html` Kodu (Komple)
Netlify'daki `index.html` dosyanın **içindekileri tamamen sil ve bu kodun tamamını yapıştırıp kaydet**:

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diesel Captan Shop - Vakumlu Telefon Tutucu</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        body {
            background-color: #0b0f19;
            color: #e0e0e0;
            line-height: 1.6;
            padding: 0;
        }
        /* Header & Nav */
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background-color: #0b0f19;
            border-bottom: 1px solid #1f293d;
        }
        .logo {
            color: #ff6600;
            font-size: 20px;
            font-weight: bold;
            line-height: 1.2;
        }
        nav a {
            color: #ccc;
            text-decoration: none;
            margin-left: 15px;
            font-size: 14px;
        }
        /* Hero Section */
        .hero {
            padding: 40px 20px;
            text-align: center;
            background: linear-gradient(rgba(11,15,25,0.85), rgba(11,15,25,0.95)), url('https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1000&q=80') no-repeat center center/cover;
            border-bottom: 1px solid #1f293d;
        }
        .hero h1 {
            color: #fff;
            font-size: 28px;
            margin-bottom: 15px;
            font-weight: 800;
        }
        .hero p {
            color: #aaa;
            font-size: 15px;
            max-width: 600px;
            margin: 0 auto;
        }
        /* Main Container */
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #131b2e;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #1f293d;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        /* Ürün Görselleri Alanı */
        .product-gallery {
            margin-bottom: 20px;
        }
        .main-image-container {
            width: 100%;
            height: 350px;
            border-radius: 10px;
            overflow: hidden;
            background: #0b0f19;
            border: 1px solid #2a3b5c;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .main-image-container img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .thumbnail-list {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding-bottom: 5px;
        }
        .thumb-item {
            width: 65px;
            height: 65px;
            border-radius: 6px;
            overflow: hidden;
            border: 2px solid #2a3b5c;
            cursor: pointer;
            flex-shrink: 0;
            background: #0b0f19;
        }
        .thumb-item.active {
            border-color: #ff6600;
        }
        .thumb-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .product-title {
            color: #fff;
            font-size: 22px;
            margin-bottom: 15px;
            font-weight: bold;
        }
        .product-desc {
            color: #aaa;
            font-size: 14px;
            margin-bottom: 20px;
        }
        .features-list {
            list-style: none;
            margin-bottom: 20px;
            color: #ccc;
            font-size: 14px;
        }
        .features-list li {
            margin-bottom: 8px;
        }
        .price-tag {
            font-size: 28px;
            color: #ff6600;
            font-weight: bold;
            margin-bottom: 20px;
        }
        /* Form & Inputs */
        .form-group {
            margin-bottom: 15px;
            text-align: left;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-size: 14px;
            color: #ccc;
        }
        .form-group input, .form-group textarea, .form-group select {
            width: 100%;
            padding: 12px;
            border: 1px solid #2a3b5c;
            background: #0b0f19;
            color: #fff;
            border-radius: 8px;
            font-size: 15px;
            outline: none;
        }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
            border-color: #ff6600;
        }
        /* Buttons */
        .btn-buy {
            width: 100%;
            background-color: #ff6600;
            color: white;
            border: none;
            padding: 16px;
            font-size: 16px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.3s;
            margin-top: 10px;
        }
        .btn-buy:hover {
            background-color: #e55c00;
        }
        /* Ödeme Logoları Alanı */
        .payment-badges {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
            margin-top: 20px;
            padding: 15px;
            background: #0b0f19;
            border-radius: 8px;
            border: 1px solid #1f293d;
            flex-wrap: wrap;
        }
        .badge-box {
            background: #fff;
            padding: 8px 15px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 14px;
            color: #333;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 38px;
        }
        .badge-box.iyzico {
            color: #2d3142;
            letter-spacing: -0.5px;
        }
        .ssl-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 10px;
            padding: 10px;
            background: #131b2e;
            border: 1px solid #2a3b5c;
            border-radius: 8px;
            color: #aaa;
            font-size: 13px;
        }
        /* Sections Box */
        .info-box {
            max-width: 600px;
            margin: 20px auto;
            background: #131b2e;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #1f293d;
        }
        .info-box h3 {
            color: #ff6600;
            font-size: 18px;
            margin-bottom: 10px;
        }
        .info-box p {
            color: #aaa;
            font-size: 14px;
        }
        /* Footer */
        footer {
            text-align: center;
            padding: 30px 20px;
            color: #777;
            font-size: 13px;
            background: #0b0f19;
            border-top: 1px solid #1f293d;
            margin-top: 40px;
        }
        footer a {
            color: #aaa;
            text-decoration: none;
            display: block;
            margin-bottom: 8px;
        }
    </style>
</head>
<body>

    <!-- Header / Nav -->
    <header>
        <div class="logo">Diesel<br>Captan Shop</div>
        <nav>
            <a href="#urun">Ürün</a>
            <a href="#hakkimizda">Hakkımızda</a>
            <a href="#iletisim">İletişim</a>
        </nav>
    </header>

    <!-- Hero Section -->
    <div class="hero">
        <h1>Yolların Yükünü Çeken Dayanıklı Aksesuarlar</h1>
        <p>Ağır vasıta ve binek araçlar için özel üretilmiş yüksek tutuşlu Vakumlu Telefon Tutucu.</p>
    </div>

    <!-- Ürün ve Sipariş Alanı -->
    <div class="container" id="urun">
        
        <!-- Ürün Fotoğraf Galerisi -->
        <div class="product-gallery">
            <div class="main-image-container">
                <img id="main-product-img" src="https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80" alt="Vakumlu Telefon Tutucu">
            </div>
            <div class="thumbnail-list">
                <div class="thumb-item active" onclick="changeImage(this, 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80')">
                    <img src="https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=200&q=80" alt="Görsel 1">
                </div>
                <div class="thumb-item" onclick="changeImage(this, 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=800&q=80')">
                    <img src="https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=200&q=80" alt="Görsel 2">
                </div>
                <div class="thumb-item" onclick="changeImage(this, 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80')">
                    <img src="https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=200&q=80" alt="Görsel 3">
                </div>
                <div class="thumb-item" onclick="changeImage(this, 'https://images.unsplash.com/photo-1533749047139-189de3cf06d3?auto=format&fit=crop&w=800&q=80')">
                    <img src="https://images.unsplash.com/photo-1533749047139-189de3cf06d3?auto=format&fit=crop&w=200&q=80" alt="Görsel 4">
                </div>
            </div>
        </div>

        <div class="product-title">Katlanabilir Vakum Tabanlı Manyetik Araç İçi Telefon Tutacağı</div>
        <div class="product-desc">
            En zorlu yol ve arazi şartlarında bile telefonunuzu sarsıntısız tutan, kilitleme mekanizmalı ve yüksek emiş gücüne sahip vakumlu tutucu.
        </div>
        
        <ul class="features-list">
            <li>✔️ Ekstra güçlü silikon vakum tabanı</li>
            <li>✔️ 360 derece dönebilen başlık</li>
            <li>✔️ Tüm telefon modelleriyle uyumlu genişletilebilir kol</li>
            <li>✔️ Torpido ve cama sorunsuz yapışma</li>
        </ul>

        <div class="form-group">
            <label for="adet">Adet ve Paket Seçimi:</label>
            <select id="adet" onchange="fiyatGuncelle()">
                <option value="1">1 Adet - 349.99 TL</option>
                <option value="2">2 Adet - 600.00 TL (Avantajlı Paket)</option>
            </select>
        </div>

        <div class="price-tag" id="toplam-fiyat">349.99 TL</div>

        <!-- Müşteri Bilgileri -->
        <div class="form-group">
            <label for="name">Ad Soyad</label>
            <input type="text" id="name" placeholder="Ad Soyad giriniz">
        </div>

        <div class="form-group">
            <label for="email">E-Posta Adresi</label>
            <input type="email" id="email" placeholder="ornek@email.com">
        </div>

        <div class="form-group">
            <label for="phone">Telefon Numarası</label>
            <input type="tel" id="phone" placeholder="05XXXXXXXXX">
        </div>

        <div class="form-group">
            <label for="address">Teslimat Adresi</label>
            <textarea id="address" rows="3" placeholder="Açık adresinizi yazınız"></textarea>
        </div>

        <button class="btn-buy" id="pay-btn" onclick="odemeBaslat()">GÜVENLİ ÖDEMEYE GEÇ</button>

        <!-- Ödeme Logoları ve Rozetler -->
        <div class="payment-badges">
            <div class="badge-box iyzico"><b>iyzico</b> ile öde</div>
            <div class="badge-box" style="color: #1a1f71; font-style: italic; font-weight: 900;">VISA</div>
            <div class="badge-box" style="display: flex; gap: -5px;">
                <span style="color: #eb001b; font-weight: bold; font-size: 16px;">●</span>
                <span style="color: #f79e1b; font-weight: bold; font-size: 16px; margin-left: -8px;">●</span>
            </div>
        </div>

        <div class="ssl-badge">
            🔒 256-Bit SSL Güvenli Ödeme
        </div>

        <!-- iyzico form alanı -->
        <div id="iyzico-checkout-form" style="margin-top: 20px;"></div>
    </div>

    <!-- Hakkımızda Bölümü -->
    <div class="info-box" id="hakkimizda">
        <h3>Hakkımızda</h3>
        <p>Diesel Captan Shop, ağır vasıta ve uzun yol şoförleri başta olmak üzere tüm araç sahiplerine en dayanıklı, kaliteli ve pratik araç içi aksesuar çözümlerini sunmak amacıyla kurulmuş resmi e-ticaret platformudur.</p>
    </div>

    <!-- Mesafeli Satış Sözleşmesi -->
    <div class="info-box">
        <h3>Mesafeli Satış Sözleşmesi</h3>
        <p>İş bu sözleşme 6502 sayılı Tüketicilerin Korunması Hakkındaki Kanun ve Mesafeli Sözleşmeler Yönetmeliği'ne uygun olarak düzenlenmiştir. Alıcı, internet sitesi üzerinden verdiği siparişin ödemesini gerçekleştirdiği anda iş bu sözleşmenin tüm koşullarını kabul etmiş sayılır.</p>
    </div>

    <!-- Teslimat ve İade -->
    <div class="info-box">
        <h3>Teslimat ve İade Koşulları</h3>
        <p><b>Teslimat:</b> Siparişleriniz en geç 3 iş günü içinde kargoya verilmektedir. Kargo teslimatı sırasında paketleri kontrol ediniz.</p>
        <p style="margin-top: 8px;"><b>İade:</b> Satın aldığınız ürünü, ambalajı bozulmamış ve kullanılmamış olmak koşuluyla teslim tarihinden itibaren 14 gün içinde iade edebilirsiniz.</p>
    </div>

    <!-- Gizlilik ve KVKK -->
    <div class="info-box">
        <h3>Gizlilik Politikası ve KVKK</h3>
        <p>Kullanıcıların kişisel bilgileri 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında güvence altındadır. Bilgileriniz üçüncü şahıslarla asla paylaşılmaz, yalnızca güvenli alışveriş ve kargo süreçleri için kullanılır.</p>
    </div>

    <!-- Footer / İletişim -->
    <footer id="iletisim">
        <a href="#hakkimizda">Hakkımızda</a>
        <a href="#urun">Ürün</a>
        <div style="margin: 20px 0; color: #ccc;">
            <p><b>İletişim Bilgileri</b></p>
            <p>E-posta: info@dieselcaptanshop.com</p>
            <p>Konum: İzmir / Türkiye</p>
            <p>Çalışma Saatleri: Hafta içi 09:00 - 18:00</p>
        </div>
        <p>© 2026 Diesel Captan Shop. Tüm Hakları Saklıdır.</p>
        <p style="margin-top: 5px; color: #555;">iyzico 256-Bit SSL Güvenli Ödeme Altyapısı</p>
    </footer>

    <script>
        function changeImage(element, imageUrl) {
            document.getElementById('main-product-img').src = imageUrl;
            const thumbs = document.getElementsByClassName('thumb-item');
            for (let i = 0; i < thumbs.length; i++) {
                thumbs[i].classList.remove('active');
            }
            element.classList.add('active');
        }

        function fiyatGuncelle() {
            const adet = document.getElementById('adet').value;
            const fiyatGosterge = document.getElementById('toplam-fiyat');
            
            if (adet === "2") {
                fiyatGosterge.innerText = "600.00 TL";
            } else {
                fiyatGosterge.innerText = "349.99 TL";
            }
        }

        function odemeBaslat() {
            const adet = document.getElementById('adet').value;
            const adSoyad = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const telefon = document.getElementById('phone').value.trim();
            const adres = document.getElementById('address').value.trim();
            const btn = document.getElementById('pay-btn');

            if (!adSoyad || !email || !telefon || !adres) {
                alert('Lütfen tüm sipariş ve teslimat bilgilerini eksiksiz doldur baskan.');
                return;
            }

            // Seçilen adete göre dinamik fiyat gönderimi (1 adet: 349.99, 2 adet: 600.00)
            const tutar = (adet === "2") ? "600.00" : "349.99";

            btn.disabled = true;
            btn.innerText = 'Ödeme Sayfası Hazırlanıyor...';

            const siparisVerileri = {
                name: adSoyad,
                email: email,
                gsmNumber: telefon,
                address: adres,
                price: tutar,
                quantity: adet
            };

            // Render backend sunucumuza istek atıyoruz
            fetch('https://dieselcaptan-apia.onrender.com/create-payment-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(siparisVerileri)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Sunucu yanıt vermedi');
                }
                return response.json();
            })
            .then(data => {
                console.log('Sunucu Yanıtı:', data);
                
                if (data.paymentPageUrl) {
                    window.location.href = data.paymentPageUrl;
                } else if (data.checkoutFormContent) {
                    const container = document.getElementById('iyzico-checkout-form');
                    container.innerHTML = data.checkoutFormContent;
                    
                    const scripts = container.getElementsByTagName('script');
                    for (let i = 0; i < scripts.length; i++) {
                        eval(scripts[i].innerText);
                    }
                    btn.style.display = 'none';
                } else {
                    alert('Ödeme başlatılamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.');
                    btn.disabled = false;
                    btn.innerText = 'GÜVENLİ ÖDEMEYE GEÇ';
                }
            })
            .catch(error => {
                console.error('Bağlantı Hatası:', error);
                alert('Ödeme servisine bağlanırken bir aksaklık oldu. Lütfen tekrar dene.');
                btn.disabled = false;
                btn.innerText = 'GÜVENLİ ÖDEMEYE GEÇ';
            });
        }
    </script>

</body>
</html>
