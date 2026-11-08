
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
        .form-group
