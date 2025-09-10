document.addEventListener('DOMContentLoaded', () => {
    // GANTI DENGAN KONFIGURASI FIREBASE ANDA!
    const firebaseConfig = {
        apiKey: "AIzaSyBc8lX-OguG0L-7gCgxhxdra7SiO0EUheY",
        authDomain: "assesment-deep-learning.firebaseapp.com",
        projectId: "assesment-deep-learning",
        storageBucket: "assesment-deep-learning.firebasestorage.app",
        messagingSenderId: "684039342926",
        appId: "1:684039342926:web:d0b87a6a73f52cda706c1f"
    };

    // Inisialisasi Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const hasilCollection = db.collection('bk1FORM1');

    // === DATA QUIZ === (Soal, Opsi, Jawaban)
    const quizData = {
        pilihanGanda: [
            { q: "Apa langkah pertama dalam berpikir komputasional saat dihadapkan pada masalah kompleks seperti mengatur acara 'Class Meeting'?", o: ["Algoritma", "Abstraksi", "Pengenalan Pola", "Dekomposisi", "Evaluasi"], a: "Dekomposisi" },
            { q: "Saat memesan makanan di aplikasi online, sistem menampilkan restoran terdekat yang memiliki menu serupa. Ini adalah contoh dari...", o: ["Dekomposisi", "Pengenalan Pola", "Abstraksi", "Algoritma", "Debugging"], a: "Pengenalan Pola" },
            { q: "Interface Go-Food yang hanya menampilkan informasi penting (nama makanan, harga, gambar) dan menyembunyikan detail kompleks server adalah penerapan dari...", o: ["Algoritma", "Dekomposisi", "Evaluasi", "Abstraksi", "Pengenalan Pola"], a: "Abstraksi" },
            { q: "Urutan langkah-langkah yang jelas untuk membuat secangkir kopi disebut...", o: ["Pola", "Abstraksi", "Dekomposisi", "Studi Kasus", "Algoritma"], a: "Algoritma" },
            { q: "Memecah tugas besar 'membersihkan rumah' menjadi tugas-tugas kecil seperti 'menyapu', 'mengepel', dan 'membersihkan jendela' adalah contoh...", o: ["Algoritma", "Dekomposisi", "Pengenalan Pola", "Abstraksi", "Proyek"], a: "Dekomposisi" },
            { q: "Melihat bahwa cara membuat nasi goreng dan mie goreng memiliki langkah dasar yang sama (menyiapkan bumbu, menumis, memasukkan bahan utama) adalah contoh dari...", o: ["Algoritma", "Dekomposisi", "Pengenalan Pola", "Abstraksi", "Memasak"], a: "Pengenalan Pola" },
            { q: "Saat menggunakan motor, kita hanya perlu tahu cara menyalakan, gas, dan rem, tanpa perlu tahu detail cara kerja mesin. Konsep ini disebut...", o: ["Algoritma", "Dekomposisi", "Pengenalan Pola", "Abstraksi", "Otomotif"], a: "Abstraksi" },
            { q: "Resep masakan adalah contoh sempurna dari sebuah...", o: ["Algoritma", "Dekomposisi", "Pengenalan Pola", "Abstraksi", "Menu"], a: "Algoritma" },
            { q: "Seorang manajer proyek membagi proyek besar menjadi beberapa 'sprint' atau tahapan kerja. Ini adalah implementasi dari...", o: ["Algoritma", "Dekomposisi", "Pengenalan Pola", "Abstraksi", "Manajemen"], a: "Dekomposisi" },
            { q: "Jika setiap hari Senin kamu memakai seragam putih abu-abu, ini adalah sebuah...", o: ["Algoritma", "Dekomposisi", "Pola", "Abstraksi", "Aturan"], a: "Pola" }
        ],
        benarSalah: [
            { q: "Dekomposisi berarti menggabungkan beberapa masalah kecil menjadi satu masalah besar.", a: false },
            { q: "Abstraksi berfokus pada detail-detail yang tidak penting dalam sebuah masalah.", a: false },
            { q: "Urutan antrian di kantin adalah contoh penerapan algoritma 'First-In, First-Out'.", a: true },
            { q: "Pengenalan pola membantu kita membuat solusi yang lebih efisien.", a: true },
            { q: "Algoritma harus selalu ditulis dalam bahasa pemrograman.", a: false }
        ],
        esai: [
            { q: "Studi Kasus: Antrian Kantin. Jelaskan bagaimana konsep Dekomposisi dapat diterapkan untuk membuat sistem antrian di kantin sekolah menjadi lebih efisien!" },
            { q: "Studi Kasus: Sistem Pesanan Online. Identifikasi minimal 2 'pola' yang bisa kamu temukan saat membandingkan aplikasi Go-Food dan Grab-Food!" },
            { q: "Studi Kasus: Class Meeting. Jelaskan proses 'Abstraksi' yang akan kamu lakukan untuk merancang sistem pendaftaran lomba Class Meeting. Informasi apa yang penting dan apa yang tidak?" },
            { q: "Buatlah sebuah 'Algoritma' dalam bentuk langkah-langkah bernomor (minimal 5 langkah) untuk proses 'Mengerjakan Tugas Rumah Matematika'!" },
            { q: "Menurutmu, di antara empat pilar berpikir komputasional (Dekomposisi, Pola, Abstraksi, Algoritma), manakah yang paling sering kamu gunakan dalam kehidupan sehari-hari? Berikan contohnya!" }
        ]
    };
    
    // === ELEMEN DOM & STATE ===
    const views = document.querySelectorAll('.view-container');
    const loginView = document.getElementById('login-view');
    const quizView = document.getElementById('quiz-view');
    const guruDashboardView = document.getElementById('guru-dashboard-view');
    let countdownInterval;
    let allStudentData = [];

    // === FUNGSI UTILITY ===
    const showView = (viewToShow) => {
        views.forEach(view => view.classList.add('hidden'));
        viewToShow.classList.remove('hidden');
    };
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // === LOGIKA LOGIN ===
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab, .login-form').forEach(el => el.classList.remove('active', 'hidden'));
            tab.classList.add('active');
            if (tab.dataset.tab === 'siswa') {
                document.getElementById('guru-login-form').classList.add('hidden');
            } else {
                document.getElementById('siswa-login-form').classList.add('hidden');
            }
        });
    });

    document.getElementById('siswa-login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nama = document.getElementById('namaLengkap').value;
        const kelas = document.getElementById('kelas').value;

        const snapshot = await hasilCollection.where('namaSiswa', '==', nama).where('kelasSiswa', '==', kelas).get();
        if (!snapshot.empty) {
            Swal.fire('Gagal!', 'Anda sudah pernah mengerjakan formatif ini.', 'error');
            return;
        }

        sessionStorage.setItem('namaSiswa', nama);
        sessionStorage.setItem('kelasSiswa', kelas);
        generateQuiz();
        showView(quizView);
    });

    document.getElementById('guru-login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (document.getElementById('guruPassword').value === 'Virus@215000') {
            loadGuruDashboard();
            showView(guruDashboardView);
        } else {
            Swal.fire('Gagal!', 'Password yang Anda masukkan salah.', 'error');
        }
    });
    
    document.getElementById('guru-logout-btn').addEventListener('click', () => window.location.reload());

    // === LOGIKA QUIZ ===
    const generateQuiz = () => {
        const quizForm = document.getElementById('quiz-form');
        let html = '';

        const shuffledPG = shuffleArray([...quizData.pilihanGanda]);
        html += `<h3>Bagian I: Pilihan Ganda</h3>`;
        shuffledPG.forEach((item, index) => {
            html += `<div class="question-block"><p class="question-text">${index + 1}. ${item.q}</p><div class="options-container">`;
            const shuffledOptions = shuffleArray([...item.o]);
            shuffledOptions.forEach((opt, i) => {
                html += `<div class="option-item"><input type="radio" id="pg${index}_${i}" name="pg${index}" value="${opt}" required><label for="pg${index}_${i}">${opt}</label></div>`;
            });
            html += `</div></div><input type="hidden" name="pg_q_${index}" value="${item.q}">`;
        });

        const shuffledBS = shuffleArray([...quizData.benarSalah]);
        html += `<h3>Bagian II: Benar / Salah</h3>`;
        shuffledBS.forEach((item, index) => {
            html += `<div class="question-block"><p class="question-text">${index + 1}. ${item.q}</p><div class="options-container">
                <div class="option-item"><input type="radio" id="bs${index}_true" name="bs${index}" value="true" required><label for="bs${index}_true">Benar</label></div>
                <div class="option-item"><input type="radio" id="bs${index}_false" name="bs${index}" value="false" required><label for="bs${index}_false">Salah</label></div>
            </div></div><input type="hidden" name="bs_q_${index}" value="${item.q}">`;
        });
        
        html += `<h3>Bagian III: Esai</h3>`;
        quizData.esai.forEach((item, index) => {
            html += `<div class="question-block"><p class="question-text">${index + 1}. ${item.q}</p>
            <textarea name="esai${index}" rows="5" placeholder="Tulis jawaban Anda di sini..." required></textarea></div>`;
        });

        quizForm.innerHTML = html + '<button type="submit" class="submit-button">Kumpulkan Jawaban</button>';
        startTimer(60 * 60);
    };

    const startTimer = (duration) => {
        let timer = duration;
        const timerDisplay = document.getElementById('countdown-timer');
        countdownInterval = setInterval(() => {
            const minutes = parseInt(timer / 60, 10);
            const seconds = parseInt(timer % 60, 10);
            timerDisplay.textContent = `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
            if (--timer < 0) {
                clearInterval(countdownInterval);
                document.getElementById('quiz-form').requestSubmit();
            }
        }, 1000);
    };

    document.getElementById('quiz-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        clearInterval(countdownInterval);
        const formData = new FormData(e.target);
        
        // Scoring PG
        let pgScore = 0;
        const pgAnswers = {};
        for (let i = 0; i < quizData.pilihanGanda.length; i++) {
            const questionText = formData.get(`pg_q_${i}`);
            const studentAnswer = formData.get(`pg${i}`);
            const originalQuestion = quizData.pilihanGanda.find(q => q.q === questionText);
            if (studentAnswer === originalQuestion.a) pgScore++;
            pgAnswers[questionText] = studentAnswer;
        }

        // Scoring B/S
        let bsScore = 0;
        const bsAnswers = {};
        for (let i = 0; i < quizData.benarSalah.length; i++) {
            const questionText = formData.get(`bs_q_${i}`);
            const studentAnswer = formData.get(`bs${i}`) === 'true';
            const originalQuestion = quizData.benarSalah.find(q => q.q === questionText);
            if (studentAnswer === originalQuestion.a) bsScore++;
            bsAnswers[questionText] = studentAnswer ? 'Benar' : 'Salah';
        }

        const esaiAnswers = {};
        quizData.esai.forEach((item, i) => esaiAnswers[item.q] = formData.get(`esai${i}`));

        const hasil = {
            namaSiswa: sessionStorage.getItem('namaSiswa'),
            kelasSiswa: sessionStorage.getItem('kelasSiswa'),
            pgScore, bsScore, pgAnswers, bsAnswers, esaiAnswers,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        await hasilCollection.add(hasil);
        Swal.fire('Berhasil!', 'Jawaban Anda telah berhasil dikumpulkan.', 'success')
            .then(() => window.location.reload());
    });
    
    // === LOGIKA DASHBOARD GURU ===
    const loadGuruDashboard = async () => {
        const snapshot = await hasilCollection.orderBy('timestamp', 'desc').get();
        allStudentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const uniqueClasses = [...new Set(allStudentData.map(item => item.kelasSiswa))];
        const filterKelas = document.getElementById('filter-kelas');
        filterKelas.innerHTML = '<option value="semua">Semua Kelas</option>';
        uniqueClasses.sort().forEach(kelas => filterKelas.innerHTML += `<option value="${kelas}">${kelas}</option>`);
        
        renderTable(allStudentData);
    };
    
    const renderTable = (data) => {
        const tableBody = document.getElementById('hasil-table-body');
        tableBody.innerHTML = '';
        data.forEach(item => {
            // Hitung Nilai Akhir: PG + Benar/Salah + Nilai Esai (jika ada)
            const nilaiEsai = item.esaiScore || 0;
            const nilaiAkhir = item.pgScore + item.bsScore + nilaiEsai;

            const tr = `
                <tr>
                    <td data-label="Nama Siswa">${item.namaSiswa}</td>
                    <td data-label="Kelas">${item.kelasSiswa}</td>
                    <td data-label="Nilai PG">${item.pgScore} / ${quizData.pilihanGanda.length}</td>
                    <td data-label="Nilai B/S">${item.bsScore} / ${quizData.benarSalah.length}</td>
                    <td data-label="Nilai Akhir (NA)"><strong>${nilaiAkhir}</strong></td>
                    <td data-label="Aksi"><button class="btn-lihat-esai" data-id="${item.id}">Lihat Esai & Nilai</button></td>
                </tr>`;
            tableBody.innerHTML += tr;
        });
    };

    // Tambahkan fungsi baru ini di file app.js Anda
    const showPenilaianDialog = (id) => {
        const data = allStudentData.find(item => item.id === id);
        if (!data) return;

        // Buat HTML untuk menampilkan jawaban esai
        let esaiHtml = '<div style="text-align:left; max-height: 300px; overflow-y: auto; padding-right: 15px;">';
        for (const [question, answer] of Object.entries(data.esaiAnswers)) {
            esaiHtml += `<p><strong>P:</strong> ${question}</p><blockquote style="margin: 5px 0; padding: 10px; background-color: #f1f1f1; border-left: 3px solid #ccc;">${answer}</blockquote>`;
        }
        esaiHtml += '</div>';

        // Buat HTML untuk form penilaian guru
        let formPenilaianHtml = `
            <hr style="margin: 20px 0;">
            <h4>Form Penilaian Total</h4>
            <p>Masukkan nilai untuk keseluruhan jawaban esai siswa.</p>
            <input type="number" id="nilai-esai" class="swal2-input" placeholder="Contoh: 85" value="${data.esaiScore || ''}">
        `;

        Swal.fire({
            title: `Penilaian Esai: ${data.namaSiswa}`,
            html: esaiHtml + formPenilaianHtml,
            width: '700px',
            showCancelButton: true,
            confirmButtonText: 'Simpan Nilai',
            cancelButtonText: 'Tutup',
            preConfirm: () => {
                const nilaiEsai = document.getElementById('nilai-esai').value;
                if (!nilaiEsai || nilaiEsai < 0 || nilaiEsai > 100) {
                    Swal.showValidationMessage('Harap masukkan nilai antara 0 dan 100');
                    return false;
                }
                return parseInt(nilaiEsai);
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const nilaiEsaiBaru = result.value;
                try {
                    // Update nilai di Firestore
                    await hasilCollection.doc(id).update({
                        esaiScore: nilaiEsaiBaru
                    });

                    // Update data di local state (agar tidak perlu reload)
                    const studentIndex = allStudentData.findIndex(item => item.id === id);
                    if (studentIndex > -1) {
                        allStudentData[studentIndex].esaiScore = nilaiEsaiBaru;
                    }
                    
                    // Render ulang tabel dengan data terbaru
                    const selectedKelas = document.getElementById('filter-kelas').value;
                    const dataToRender = selectedKelas === 'semua' ? allStudentData : allStudentData.filter(d => d.kelasSiswa === selectedKelas);
                    renderTable(dataToRender);

                    Swal.fire('Tersimpan!', 'Nilai esai berhasil disimpan.', 'success');
                } catch (error) {
                    console.error("Error updating score: ", error);
                    Swal.fire('Gagal!', 'Terjadi kesalahan saat menyimpan nilai.', 'error');
                }
            }
        });
    };
    
    document.getElementById('filter-kelas').addEventListener('change', (e) => {
        const selectedKelas = e.target.value;
        const dataToRender = selectedKelas === 'semua' ? allStudentData : allStudentData.filter(d => d.kelasSiswa === selectedKelas);
        renderTable(dataToRender);
    });

    document.getElementById('export-pdf-btn').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const selectedKelas = document.getElementById('filter-kelas').value;
        const dataToExport = selectedKelas === 'semua' ? allStudentData : allStudentData.filter(d => d.kelasSiswa === selectedKelas);

        if (dataToExport.length === 0) return Swal.fire('Info', 'Tidak ada data untuk diekspor.', 'info');

        const tableColumn = ["Nama", "Kelas", "Nilai PG", "Nilai B/S", "Nilai Total"];
        const tableRows = dataToExport.map(item => [
            item.namaSiswa, item.kelasSiswa, `${item.pgScore}/${quizData.pilihanGanda.length}`,
            `${item.bsScore}/${quizData.benarSalah.length}`, item.pgScore + item.bsScore
        ]);

        doc.text(`Hasil Formatif Dekomposisi - Kelas ${selectedKelas === 'semua' ? 'Semua' : selectedKelas}`, 14, 15);
        doc.autoTable({ head: [tableColumn], body: tableRows, startY: 25 });
        doc.save(`hasil-formatif-${selectedKelas}.pdf`);
    });
    
    document.getElementById('hasil-table-body').addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('btn-lihat-esai')) {
        const id = e.target.dataset.id;
        showPenilaianDialog(id); // Panggil fungsi dialog penilaian yang baru
    }
});

    // Inisialisasi
    showView(loginView);
});