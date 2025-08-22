document.addEventListener('DOMContentLoaded', () => {
    // GANTI DENGAN KONFIGURASI FIREBASE ANDA!
    const firebaseConfig = {
        apiKey: "AIzaSyBc8lX-OguG0L-7gCgxhxdra7SiO0EUheY",
        authDomain: "assesment-deep-learning.firebaseapp.com",
        projectId: "assesment-deep-learning",
        storageBucket: "assesment-deep-learning.firebasestorage.app",
        messagingSenderId: "684039342926",
        appId: "1:684039342926:web:e06c3914a3782338706c1f"
    };

    // Inisialisasi Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();
    const bk1LAD = db.collection('bk1LAD');
    let allStudentData = [];

    // === DATA QUIZ ===
    const quizData = {
        pilihanGanda: [
            { q: "1. Apa yang dimaksud dengan algoritma?", o: ["Sistem jaringan komputer", "Urutan langkah logis untuk menyelesaikan masalah", "Bahasa pemrograman", "Program komputer otomatis"], a: "B" },
            { q: "2. Manakah contoh aktivitas yang menggunakan pola pikir komputasional?", o: ["Menyusun daftar belanja", "Menggambar pemandangan", "Membaca puisi", "Menghafal lagu"], a: "A" },
            { q: "3. Saat menghadapi masalah besar, apa yang bisa kamu lakukan terlebih dahulu?", o: ["Menghindari masalah", "Menyelesaikannya langsung secara keseluruhan", "Memecah menjadi bagian-bagian kecil", "Menunggu orang lain menyelesaikannya"], a: "C" }
        ],
        skalaLikert: [
            "1. Saya senang menyelesaikan masalah atau tantangan yang rumit.",
            "2. Saya pernah membuat langkah-langkah sistematis dalam menyelesaikan tugas.",
            "3. Saya merasa teknologi bisa membantu menyelesaikan banyak permasalahan.",
            "4. Saya mampu bekerja sama dengan teman untuk menyelesaikan masalah.",
            "5. Saya memahami bagaimana teknologi seperti komputer bekerja menyelesaikan masalah."
        ],
        isian: [
            "1. Ceritakan salah satu pengalamanmu saat menyelesaikan masalah yang sulit!",
            "2. Apa harapanmu dalam mengikuti pembelajaran ini?",
            "3. Bagaimana kamu biasanya menyelesaikan masalah yang kompleks dalam kehidupan sehari-hari?"
        ]
    };

    // === ELEMEN DOM ===
    const views = document.querySelectorAll('.view-container');
    const loginView = document.getElementById('login-view');
    const quizView = document.getElementById('quiz-view');
    const guruDashboardView = document.getElementById('guru-dashboard-view');
    
    let currentUser = null;
    let likertChart = null;

    // === FUNGSI UTAMA ===
    const showView = (viewToShow) => {
        views.forEach(view => view.classList.add('hidden'));
        viewToShow.classList.remove('hidden');
    };

    // Otentikasi Anonim
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
        } else {
            auth.signInAnonymously().catch(error => console.error("Auth error:", error));
        }
    });

    // === LOGIKA LOGIN ===
    const tabs = document.querySelectorAll('.tab');
    const siswaLoginForm = document.getElementById('siswa-login-form');
    const guruLoginForm = document.getElementById('guru-login-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            if (tab.dataset.tab === 'siswa') {
                siswaLoginForm.classList.remove('hidden');
                guruLoginForm.classList.add('hidden');
            } else {
                siswaLoginForm.classList.add('hidden');
                guruLoginForm.classList.remove('hidden');
            }
        });
    });

    // Login Siswa    
    siswaLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const namaLengkap = document.getElementById('namaLengkap').value;
        const kelas = document.getElementById('kelas').value;

        // --- PERUBAHAN DI SINI ---
        // Cek apakah siswa dengan nama dan kelas yang sama sudah pernah mengerjakan
        const snapshot = await bk1LAD
            .where('namaSiswa', '==', namaLengkap)
            .where('kelasSiswa', '==', kelas)
            .get();

        if (!snapshot.empty) {
            alert('Siswa dengan nama dan kelas ini sudah pernah mengerjakan asesmen!');
            return;
        }
        // --- AKHIR PERUBAHAN ---

        sessionStorage.setItem('namaSiswa', namaLengkap);
        sessionStorage.setItem('kelasSiswa', kelas);
        generateQuiz();
        showView(quizView);
    });

    // Login Guru
    guruLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('guruPassword').value;
        if (password === 'Virus@215000') {
            loadGuruDashboard();
            showView(guruDashboardView);
        } else {
            alert('Password salah!');
        }
    });

    // === LOGIKA QUIZ ===
    const generateQuiz = () => {
        const quizForm = document.getElementById('quiz-form');
        let html = '<h3>Bagian I: Pengetahuan Awal (Pilihan Ganda)</h3>';

        // Generate Pilihan Ganda dengan struktur HTML baru
        quizData.pilihanGanda.forEach((item, index) => {
            html += `<div class="question-block card">
                        <p class="question-text">${item.q}</p>
                        <div class="options-container">`;
            item.o.forEach((opt, i) => {
                const optionLetter = String.fromCharCode(65 + i);
                // Struktur input + label untuk styling yang lebih baik
                html += `<div class="option-item">
                            <input type="radio" id="pg${index}_${i}" name="pg${index}" value="${optionLetter}" required>
                            <label for="pg${index}_${i}">${optionLetter}. ${opt}</label>
                        </div>`;
            });
            html += `</div></div>`;
        });

        // Generate Skala Likert dengan struktur HTML baru
        html += '<h3>Bagian II: Persepsi dan Sikap (Skala Likert)</h3>';
        quizData.skalaLikert.forEach((pernyataan, index) => {
            html += `<div class="question-block card">
                        <p class="question-text">${pernyataan}</p>
                        <div class="likert-options-container">`;
            ['SS', 'S', 'TS', 'STS'].forEach(skala => {
                // Struktur input + label untuk styling
                html += `<div class="likert-item">
                            <input type="radio" id="likert${index}_${skala}" name="likert${index}" value="${skala}" required>
                            <label for="likert${index}_${skala}">${skala}</label>
                        </div>`;
            });
            html += `</div></div>`;
        });

        // Generate Isian
        html += '<h3>Bagian III: Refleksi Singkat (Isian)</h3>';
        quizData.isian.forEach((pertanyaan, index) => {
            html += `<div class="question-block card">
                        <p class="question-text">${pertanyaan}</p>
                        <textarea name="isian${index}" rows="5" placeholder="Tulis jawaban Anda di sini..." required></textarea>
                    </div>`;
        });

        quizForm.innerHTML = html + '<button type="submit" class="submit-button">Kumpulkan Jawaban</button>';
    };

    // Submit Quiz
    document.getElementById('quiz-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        let pgAnswers = {}, likertAnswers = {}, isianAnswers = {};
        let pgScore = 0;

        // Kumpulkan dan hitung skor
        quizData.pilihanGanda.forEach((q, i) => {
            const answer = formData.get(`pg${i}`);
            pgAnswers[`q${i}`] = answer;
            if (answer === q.a) pgScore++;
        });
        quizData.skalaLikert.forEach((q, i) => { likertAnswers[`q${i}`] = formData.get(`likert${i}`); });
        quizData.isian.forEach((q, i) => { isianAnswers[`q${i}`] = formData.get(`isian${i}`); });
        
        const hasil = {
            namaSiswa: sessionStorage.getItem('namaSiswa'),
            kelasSiswa: sessionStorage.getItem('kelasSiswa'),
            ownerId: currentUser.uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            pilihanGandaAnswers: pgAnswers,
            pilihanGandaScore: pgScore,
            skalaLikertAnswers: likertAnswers,
            isianAnswers: isianAnswers
        };

        await bk1LAD.add(hasil);
        alert('Jawaban berhasil dikumpulkan!');
        window.location.reload();
    });

    // === LOGIKA DASHBOARD GURU ===
    const loadGuruDashboard = async () => {
        try {
            const snapshot = await bk1LAD.orderBy('timestamp', 'desc').get();
            allStudentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (allStudentData.length === 0) {
                // Handle jika tidak ada data
                document.getElementById('stat-total-siswa').textContent = '0';
                document.getElementById('stat-rata-rata-pg').textContent = '0';
                document.getElementById('stat-likert-umum').textContent = '-';
                return;
            }

            updateStatistics(allStudentData);
            populateFilterDropdown();
            renderTable(allStudentData);
            attachEventListeners(); // Panggil event listener baru
            
        } catch (error) {
            console.error("Gagal memuat data dashboard:", error);
        }
    };

    // FUNGSI BARU untuk mengupdate widget statistik
    const updateStatistics = (data) => {
        const totalSiswa = data.length;
        const totalNilaiPg = data.reduce((sum, doc) => sum + doc.pilihanGandaScore, 0);
        const allLikertCounts = { SS: 0, S: 0, TS: 0, STS: 0 };
        data.forEach(doc => {
            for (const key in doc.skalaLikertAnswers) {
                allLikertCounts[doc.skalaLikertAnswers[key]]++;
            }
        });

        const rataRataPg = totalSiswa > 0 ? (totalNilaiPg / totalSiswa).toFixed(1) : 0;
        const likertUmum = Object.keys(allLikertCounts).reduce((a, b) => allLikertCounts[a] > allLikertCounts[b] ? a : b, '-');
        
        document.getElementById('stat-total-siswa').textContent = totalSiswa;
        document.getElementById('stat-rata-rata-pg').textContent = rataRataPg;
        document.getElementById('stat-likert-umum').textContent = likertUmum;
        
        renderLikertChart(allLikertCounts);
    };

    // FUNGSI BARU untuk merender tabel
    const renderTable = (dataToRender) => {
        const hasilTableBody = document.getElementById('hasil-table-body');
        hasilTableBody.innerHTML = '';
        dataToRender.forEach(data => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="Nama Siswa">${data.namaSiswa}</td>
                <td data-label="Kelas">${data.kelasSiswa}</td>
                <td data-label="Nilai PG">${data.pilihanGandaScore} / ${quizData.pilihanGanda.length}</td>
                <td data-label="Nilai Total">${data.nilaiTotal || '-'}</td>
                <td data-label="Aksi"><button class="btn-lihat-isian" data-id="${data.id}">Detail & Nilai</button></td>
            `;
            hasilTableBody.appendChild(tr);
        });
    };

    // FUNGSI BARU untuk mengisi dropdown filter dan memasang semua event listener
    const populateFilterDropdown = () => {
        const filterKelas = document.getElementById('filter-kelas');
        const uniqueClasses = [...new Set(allStudentData.map(item => item.kelasSiswa))];
        filterKelas.innerHTML = '<option value="semua">Semua Kelas</option>';
        uniqueClasses.sort().forEach(kelas => {
            filterKelas.innerHTML += `<option value="${kelas}">${kelas}</option>`;
        });
    };

    // FUNGSI BARU untuk semua event listener dashboard
    const attachEventListeners = () => {
        // Listener untuk filter kelas
        document.getElementById('filter-kelas').addEventListener('change', (e) => {
            const selectedKelas = e.target.value;
            if (selectedKelas === 'semua') {
                renderTable(allStudentData);
            } else {
                const filteredData = allStudentData.filter(data => data.kelasSiswa === selectedKelas);
                renderTable(filteredData);
            }
        });

        // Listener untuk tombol Export PDF
        document.getElementById('export-pdf-btn').addEventListener('click', () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const selectedKelas = document.getElementById('filter-kelas').value;
            const dataToExport = selectedKelas === 'semua' 
                ? allStudentData 
                : allStudentData.filter(data => data.kelasSiswa === selectedKelas);

            if (dataToExport.length === 0) {
                Swal.fire('Info', 'Tidak ada data untuk diekspor.', 'info');
                return;
            }

            const tableColumn = ["Nama", "Kelas", "Nilai PG", "Nilai Total", "Refleksi Guru"];
            const tableRows = [];

            dataToExport.forEach(item => {
                const rowData = [
                    item.namaSiswa,
                    item.kelasSiswa,
                    `${item.pilihanGandaScore}/${quizData.pilihanGanda.length}`,
                    item.nilaiTotal || '-',
                    item.refleksiGuru || '-'
                ];
                tableRows.push(rowData);
            });

            doc.text(`Laporan Hasil Asesmen Diagnostik`, 14, 15);
            doc.setFontSize(11);
            doc.text(`Kelas: ${selectedKelas === 'semua' ? 'Semua Kelas' : selectedKelas}`, 14, 22);

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 30,
            });
            
            doc.save(`Laporan Asesmen Diagnostik - ${selectedKelas}.pdf`);
        });
        
        // Delegasi event untuk tombol "Detail & Nilai"
        document.getElementById('hasil-table-body').addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('btn-lihat-isian')) {
                const docId = e.target.dataset.id;
                showDetailDialog(docId);
            }
        });
    };
    
    const renderLikertChart = (counts) => {
        const ctx = document.getElementById('likert-chart').getContext('2d');
        if(likertChart) likertChart.destroy();
        likertChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Sangat Setuju (SS)', 'Setuju (S)', 'Tidak Setuju (TS)', 'Sangat Tidak Setuju (STS)'],
                datasets: [{
                    data: [counts.SS, counts.S, counts.TS, counts.STS],
                    backgroundColor: ['#28a745', '#17a2b8', '#ffc107', '#dc3545']
                }]
            },
            options: { responsive: true, plugins: { legend: { position: 'top' } } }
        });
    };

    const attachDashboardEventListeners = () => {
        document.querySelectorAll('.btn-lihat-isian, .btn-cetak').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const docId = e.target.dataset.id;
                
                if (e.target.classList.contains('btn-lihat-isian')) {
                    showDetailDialog(docId); // Panggil fungsi dialog baru
                } else if (e.target.classList.contains('btn-cetak')) {
                    const doc = await hasilCollection.doc(docId).get();
                    const data = doc.data();
                    printHasil(data);
                }
            });
        });
    };

    // FUNGSI BARU UNTUK DIALOG DETAIL SISWA
    const showDetailDialog = async (docId) => {
        const doc = await bk1LAD.doc(docId).get();
        if (!doc.exists) {
            Swal.fire('Error', 'Data siswa tidak ditemukan.', 'error');
            return;
        }
        const data = doc.data();

        // Bangun konten HTML untuk dialog
        let likertHtml = '<h4>Bagian II: Persepsi dan Sikap</h4><ul>';
        quizData.skalaLikert.forEach((q, i) => {
            likertHtml += `<li>${q} <br><strong>Jawaban: ${data.skalaLikertAnswers[`q${i}`]}</strong></li>`;
        });
        likertHtml += '</ul>';

        let isianHtml = '<h4>Bagian III: Refleksi Singkat</h4><ul>';
        quizData.isian.forEach((q, i) => {
            isianHtml += `<li><p>${q}</p><blockquote>"${data.isianAnswers[`q${i}`]}"</blockquote></li>`;
        });
        isianHtml += '</ul>';

        let formGuruHtml = `
            <hr>
            <h4>Refleksi & Penilaian Guru</h4>
            <div class="swal-form-group">
                <label for="refleksiGuru">Refleksi / Umpan Balik</label>
                <textarea id="refleksiGuru" class="swal2-textarea" placeholder="Tuliskan umpan balik untuk siswa...">${data.refleksiGuru || ''}</textarea>
            </div>
            <div class="swal-form-group">
                <label for="nilaiTotal">Nilai Total (opsional)</label>
                <input type="number" id="nilaiTotal" class="swal2-input" placeholder="Masukkan nilai akhir" value="${data.nilaiTotal || ''}">
            </div>
        `;

        // Tampilkan SweetAlert2
        Swal.fire({
            title: `Detail Jawaban: ${data.namaSiswa}`,
            html: `
                <div class="swal-content-container">
                    ${likertHtml}
                    ${isianHtml}
                    ${formGuruHtml}
                </div>
            `,           
            showCancelButton: true,
            confirmButtonText: 'Simpan Refleksi',
            cancelButtonText: 'Tutup',
            preConfirm: () => {
                // Ambil data dari form sebelum dialog ditutup
                const refleksi = document.getElementById('refleksiGuru').value;
                const nilai = document.getElementById('nilaiTotal').value;
                return {
                    refleksiGuru: refleksi,
                    nilaiTotal: nilai ? parseFloat(nilai) : null // Simpan sebagai angka atau null
                };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Jika guru menekan "Simpan Refleksi"
                try {
                    await bk1LAD.doc(docId).update(result.value);
                    Swal.fire('Tersimpan!', 'Refleksi dan nilai berhasil disimpan.', 'success');
                    loadGuruDashboard(); // Muat ulang data dashboard untuk menampilkan perubahan
                } catch (error) {
                    console.error("Error updating document: ", error);
                    Swal.fire('Gagal!', 'Terjadi kesalahan saat menyimpan data.', 'error');
                }
            }
        });
    };
    
    const printHasil = (data) => {
        let printContent = `
            <h1>Hasil Asesmen Diagnostik</h1>
            <p><strong>Nama:</strong> ${data.namaSiswa}</p>
            <p><strong>Kelas:</strong> ${data.kelasSiswa}</p>
            <hr>
            <h3>Bagian I: Pengetahuan Awal</h3>
            <p><strong>Skor:</strong> ${data.pilihanGandaScore} dari ${quizData.pilihanGanda.length} benar</p>
            <h3>Bagian II: Persepsi dan Sikap</h3>
        `;
        quizData.skalaLikert.forEach((q, i) => {
            printContent += `<p>${q} <strong>Jawaban: ${data.skalaLikertAnswers[`q${i}`]}</strong></p>`;
        });
        printContent += `<h3>Bagian III: Refleksi Singkat</h3>`;
        quizData.isian.forEach((q, i) => {
            printContent += `<p><strong>${q}</strong></p><p>${data.isianAnswers[`isian${i}`]}</p>`;
        });
        document.getElementById('cetak-view').innerHTML = printContent;
        window.print();
    };

    document.getElementById('guru-logout-btn').addEventListener('click', () => {
        window.location.reload();
    });

    // Inisialisasi
    showView(loginView);
});