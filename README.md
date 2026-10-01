# BPCareU - Official Store & Partnership Portal

Situs resmi katalog produk kesehatan dan paket kemitraan **BP Group** (British Propolis, Steffi Stevia, Brassic Eye, Brassic Pro, dan BP Norway Salmon Fish Oil) yang telah dimigrasikan ke arsitektur modern berbasis **Astro 5**.

---

## 🚀 Fitur Utama

- **Katalog Produk Terstruktur**: Render sisi server (SSR/SSG) untuk SEO maksimal, dilengkapi filter kategori interaktif dan modal detail lengkap (komposisi, aturan pakai, izin BPOM, khasiat).
- **Tabel Daftar Harga Kemitraan 2026**: Rincian 6 paket resmi BP Group (Satuan, Family, Agent, AP, SAP, SE) dengan kalkulasi otomatis.
- **Keranjang Belanja (Off-Canvas Drawer)**: Manajemen state keranjang yang tersimpan otomatis di `localStorage`.
- **Checkout WhatsApp Terintegrasi**: Form pemesanan dengan validasi nomor telepon Indonesia, perlindungan honeypot anti-spam, dan format pesan WhatsApp resmi.
- **Kalkulator Dosis British Propolis**: Rekomendasi tetes & aturan pakai otomatis berdasarkan berat badan, kategori usia (dewasa/anak), dan tujuan konsumsi (imunitas, pemulihan, kronis).
- **FAQ Accordion & Notifikasi Toast**: Interaksi UI yang responsif dan ringan tanpa dependensi pustaka berat.
- **SEO & Schema.org**: Dilengkapi meta OpenGraph, Twitter Cards, canonical tag, serta Schema.org JSON-LD `MedicalBusiness`.

---

## 🛠️ Tech Stack

- **Framework**: [Astro 5](https://astro.build/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) dengan palet kustom `bpRed` & `emeraldBrand`
- **Language**: TypeScript (Strict Mode)
- **Testing**: [Vitest](https://vitest.dev/)
- **Fonts & Icons**: Plus Jakarta Sans & Font Awesome 6

---

## 📁 Struktur Proyek

```text
bpcareu/
├── public/
│   ├── favicon.svg          # Favicon resmi BP
│   └── robots.txt           # Konfigurasi perayap mesin pencari
├── src/
│   ├── components/          # Komponen modular Astro
│   │   ├── CartDrawer.astro
│   │   ├── CheckoutModal.astro
│   │   ├── DoseCalculator.astro
│   │   ├── Faq.astro
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   ├── Hero.astro
│   │   ├── Legality.astro
│   │   ├── PricingTable.astro
│   │   ├── ProductCatalog.astro
│   │   ├── ProductModal.astro
│   │   └── Toast.astro
│   ├── config/
│   │   └── site.ts          # Konfigurasi nomor WhatsApp CS & metadata
│   ├── data/                # Database produk, paket harga, dan FAQ
│   │   ├── faq.ts
│   │   ├── packages.ts
│   │   └── products.ts
│   ├── layouts/
│   │   └── Layout.astro     # Layout dasar HTML & optimasi SEO
│   ├── pages/
│   │   └── index.astro      # Halaman utama
│   ├── scripts/
│   │   └── app.ts           # Kontroler logika klien (keranjang, modal, filter)
│   ├── styles/
│   │   └── global.css       # Tailwind base, components, utilities & custom scrollbar
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces & types
│   └── utils/               # Modul helper mandiri (kalkulator, WhatsApp, format rupiah)
│       ├── calculator.ts
│       ├── formatters.ts
│       └── whatsapp.ts
├── tests/                   # Rangkaian pengujian otomatis (Unit Testing)
│   ├── build.test.ts
│   ├── calculator.test.ts
│   ├── data.test.ts
│   ├── formatters.test.ts
│   └── whatsapp.test.ts
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

---

## 💻 Panduan Menjalankan

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Mode Pengembangan (Development)
```bash
npm run dev
```
Buka peramban di `http://localhost:4321`.

### 3. Pengujian Otomatis (Testing)
Menjalankan seluruh unit test (integritas data produk, kalkulator dosis, validasi nomor HP, pembuat pesan WhatsApp, dan verifikasi keluaran build):
```bash
npm test
```

### 4. Build untuk Produksi
```bash
npm run build
```
Hasil berkas produksi yang telah dioptimasi, diminifikasi, dan di-*bundle* akan berada di folder `dist/`.

### 5. Pratinjau Hasil Build (Preview)
```bash
npm run preview
```
