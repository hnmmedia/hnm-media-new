document.addEventListener("DOMContentLoaded", function () {

    // --- 1. NAVBAR STICKY ---
    const navbar = document.querySelector(".navbar");
    if(navbar) {
        window.addEventListener("scroll", function () {
            if (window.scrollY > 50) navbar.classList.add("scrolled");
            else navbar.classList.remove("scrolled");
        });
    }

    // --- 2. LOGIKA LOKASI OTOMATIS ---
    cekLokasiPengguna();

    function cekLokasiPengguna() {
        // Cek apakah browser mendukung Geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(suksesGPS, gagalGPS);
        } else {
            // Jika browser tua/tidak support, pakai default Sidoarjo
            gagalGPS(); 
        }
    }

    // A. JIKA LOKASI DITEMUKAN (GPS AKTIF)
    function suksesGPS(position) {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;
        
        // Ubah teks lokasi di HTML
        document.getElementById('lokasi-kota').innerText = "Lokasi Anda (GPS)";
        document.getElementById('lokasi-kota').style.color = "#e68a00"; // Warna Emas

        // Panggil API berdasarkan KOORDINAT
        const apiURL = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${long}&method=20`;
        ambilDataAPI(apiURL);
    }

    // B. JIKA LOKASI DITOLAK / ERROR (DEFAULT SIDOARJO)
    function gagalGPS() {
        console.log("GPS tidak diizinkan atau error. Menggunakan default Sidoarjo.");
        
        // Ubah teks lokasi
        document.getElementById('lokasi-kota').innerText = "Sidoarjo, Jawa Timur";
        
        // Panggil API berdasarkan KOTA SIDOARJO
        const apiURL = `https://api.aladhan.com/v1/timingsByCity?city=Sidoarjo&country=Indonesia&method=20`;
        ambilDataAPI(apiURL);
    }

    // C. FUNGSI UTAMA PENGAMBIL DATA (Dipakai oleh fungsi A dan B)
    function ambilDataAPI(url) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const jadwal = data.data.timings;
                const hijri = data.data.date.hijri;

                // Update Tanggal Hijriyah
                const elHijri = document.getElementById('tanggal-hijriyah');
                if(elHijri) elHijri.innerText = `${hijri.day} ${hijri.month.en} ${hijri.year} H`;

                // Update Tanggal Masehi
                const dateNow = new Date();
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const elMasehi = document.getElementById('tanggal-masehi');
                if(elMasehi) elMasehi.innerText = dateNow.toLocaleDateString('id-ID', options);

                // Update Jam ke HTML (Pastikan ID HTML sudah benar!)
                updateText('jam-subuh', jadwal.Fajr);
                updateText('jam-dzuhur', jadwal.Dhuhr);
                updateText('jam-ashar', jadwal.Asr);
                updateText('jam-maghrib', jadwal.Maghrib);
                updateText('jam-isya', jadwal.Isha);

                // Jalankan Highlight
                highlightNextPrayer(jadwal);
            })
            .catch(error => console.error("Error API:", error));
    }

    // Fungsi helper update teks aman
    function updateText(id, text) {
        const el = document.getElementById(id);
        if(el) el.innerText = text;
    }

    // Fungsi Highlight Sholat Berikutnya
    function highlightNextPrayer(jadwal) {
        const now = new Date();
        const curMin = (now.getHours() * 60) + now.getMinutes();
        
        const list = [
            { id: 'card-subuh', time: jadwal.Fajr },
            { id: 'card-dzuhur', time: jadwal.Dhuhr },
            { id: 'card-ashar', time: jadwal.Asr },
            { id: 'card-maghrib', time: jadwal.Maghrib },
            { id: 'card-isya', time: jadwal.Isha }
        ];

        let nextId = 'card-subuh'; 

        for (let item of list) {
            const [h, m] = item.time.split(':');
            const itemMin = (parseInt(h) * 60) + parseInt(m);
            if (itemMin > curMin) {
                nextId = item.id;
                break;
            }
        }

        // Reset & Set Active
        document.querySelectorAll('.sholat-card').forEach(c => c.classList.remove('active'));
        const elNext = document.getElementById(nextId);
        if(elNext) elNext.classList.add('active');
    }
});


// Script Logika Buka/Tutup
    const btnBuka = document.getElementById('btn-quran');
    const modalView = document.getElementById('modal-quran');

    if(btnBuka) {
        btnBuka.addEventListener('click', function() {
            modalView.style.display = "block";
            document.body.style.overflow = "hidden"; // Kunci Scroll Web Utama
        });
    }

    function tutupQuran() {
        modalView.style.display = "none";
        document.body.style.overflow = "auto"; // Buka Scroll
    }
