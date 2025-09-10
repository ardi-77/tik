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
    const penilaianCollection = db.collection('bk1LKM');

    // === ELEMEN DOM & STATE ===
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');
    const modal = document.getElementById('detailModal');
    
    // === LOGIKA LOGIN ===
    const checkLoginStatus = () => {
        if (sessionStorage.getItem('guruLoggedInLKM') === 'true') {
            loginView.classList.add('hidden');
            appView.classList.remove('hidden');
            initApp();
        } else {
            loginView.classList.remove('hidden');
            appView.classList.add('hidden');
        }
    };

    document.getElementById('formLoginGuru').addEventListener('submit', (e) => {
        e.preventDefault();
        if (document.getElementById('password').value === 'Virus@215000') {
            sessionStorage.setItem('guruLoggedInLKM', 'true');
            checkLoginStatus();
        } else {
            const errorElement = document.getElementById('guruError');
            errorElement.textContent = 'Password yang Anda masukkan salah.';
            errorElement.style.display = 'block';
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        sessionStorage.removeItem('guruLoggedInLKM');
        window.location.reload();
    });

    // === LOGIKA APLIKASI UTAMA ===
    const aspekPenilaian = [
        { id: 1, aspek: 'Identifikasi Masalah', kegiatan: 'Apa saja masalah utama dalam kasus di atas? Tuliskan minimal 3! Mengapa masalah ini penting untuk diselesaikan?' },
        { id: 2, aspek: 'Dekomposisi Masalah', kegiatan: 'Pecahkan masalah menjadi beberapa bagian lebih kecil. Contoh: Pengumpulan data pembeli, waktu tunggu, kapasitas layanan, sistem pemesanan' },
        { id: 3, aspek: 'Pengenalan Pola & Abstraksi', kegiatan: 'Apakah kamu melihat pola dalam masalah tersebut? Jelaskan. Apa informasi yang tidak relevan dan bisa diabaikan?' },
        { id: 4, aspek: 'Solusi & Visualisasi', kegiatan: 'Buatlah diagram alur (flowchart) atau pseudocode yang menggambarkan solusi digital untuk mengatur antrean' },
        { id: 5, aspek: 'Refleksi & Kerjasama Kelompok', kegiatan: 'Apa yang kamu pelajari dari kegiatan ini? Apakah pendekatan berpikir komputasional membantu dalam memahami dan menyelesaikan masalah?' }
    ];

    const getPredikat = (nilai) => {
        if (nilai <= 10) return 'D (Perlu Bimbingan)';
        if (nilai <= 14) return 'C (Cukup)';
        if (nilai <= 17) return 'B (Baik)';
        return 'A (Sangat Baik)';
    };

    const calculateTotal = () => {
        let totalNilai = 0, count = 0;
        aspekPenilaian.forEach(item => {
            const nilai = parseInt(document.getElementById(`nilai_${item.id}`).value);
            if (!isNaN(nilai)) { totalNilai += nilai; count++; }
        });
        const rataRata = count > 0 ? (totalNilai / count) : 0;
        document.getElementById('totalScoreValue').textContent = `${rataRata.toFixed(2)} (${getPredikat(rataRata)})`;
    };

    const generateAspekTable = () => {
        const tableBody = document.getElementById('aspekTableBody');
        if (tableBody.innerHTML !== '') return;
        aspekPenilaian.forEach(item => {
            tableBody.innerHTML += `
                <tr>
                    <td>${item.aspek}</td> <td>${item.kegiatan}</td>
                    <td><input type="number" id="nilai_${item.id}" min="1" max="20" required oninput="updatePredikat(${item.id})"></td>
                    <td id="predikat_${item.id}">-</td>
                </tr>`;
        });
    };

    window.updatePredikat = (id) => {
        const nilai = parseInt(document.getElementById(`nilai_${id}`).value);
        document.getElementById(`predikat_${id}`).textContent = (nilai >= 1 && nilai <= 20) ? getPredikat(nilai) : '-';
        calculateTotal();
    };

    document.getElementById('penilaianForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const penilaianId = document.getElementById('penilaianId').value;
        
        const aspekData = aspekPenilaian.map(item => {
            const nilai = parseInt(document.getElementById(`nilai_${item.id}`).value);
            return { id: item.id, aspek: item.aspek, kegiatan: item.kegiatan, nilai, predikat: getPredikat(nilai) };
        });

        const rataRata = (aspekData.reduce((sum, item) => sum + item.nilai, 0) / aspekData.length).toFixed(2);
        
        const penilaianData = {
            topik: document.getElementById('topik').value,
            tujuanPembelajaran: document.getElementById('tujuanPembelajaran').value,
            kelas: document.getElementById('kelas').value,
            tanggal: document.getElementById('tanggal').value,
            namaKelompok: document.getElementById('namaKelompok').value,
            namaSiswa: document.getElementById('namaSiswa').value,
            aspek: aspekData,
            rataRata: rataRata,
            predikatAkhir: getPredikat(rataRata),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            if (penilaianId) {
                await penilaianCollection.doc(penilaianId).update(penilaianData);
                alert('Data penilaian berhasil diperbarui!');
            } else {
                await penilaianCollection.add(penilaianData);
                alert('Data penilaian berhasil disimpan!');
            }
            cancelEdit();
            loadPenilaian();
        } catch (error) {
            console.error("Error saving data: ", error);
            alert('Gagal menyimpan data.');
        }
    });

    const loadPenilaian = async () => {
        const filter = document.getElementById('filterKelas').value;
        let query = penilaianCollection;
        if (filter !== 'semua') {
            query = query.where('kelas', '==', filter);
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();
        const tableBody = document.getElementById('reportTableBody');
        tableBody.innerHTML = '';

        if (snapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Belum ada data penilaian.</td></tr>`;
        } else {
            snapshot.forEach(doc => {
                const item = doc.data();
                tableBody.innerHTML += `
                    <tr>
                        <td>${item.kelas}</td><td>${item.namaKelompok}</td>
                        <td>${new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                        <td>${item.topik}</td><td>${item.predikatAkhir}</td>
                        <td class="no-print">
                            <div class="action-buttons">
                                <button class="btn-secondary" onclick="showDetail('${doc.id}')">Lihat</button>
                                <button class="btn-warning" onclick="editPenilaian('${doc.id}')">Ubah</button>
                                <button class="btn-danger" onclick="deletePenilaian('${doc.id}')">Hapus</button>
                            </div>
                        </td>
                    </tr>`;
            });
        }
    };

    window.editPenilaian = async (id) => {
        const doc = await penilaianCollection.doc(id).get();
        if (!doc.exists) return;
        const item = doc.data();
        
        document.getElementById('penilaianId').value = id;
        document.getElementById('topik').value = item.topik;
        document.getElementById('tujuanPembelajaran').value = item.tujuanPembelajaran;
        document.getElementById('kelas').value = item.kelas;
        document.getElementById('tanggal').value = item.tanggal;
        document.getElementById('namaKelompok').value = item.namaKelompok;
        document.getElementById('namaSiswa').value = item.namaSiswa;
        item.aspek.forEach(aspek => {
            document.getElementById(`nilai_${aspek.id}`).value = aspek.nilai;
            updatePredikat(aspek.id);
        });

        document.getElementById('formLegend').textContent = 'Ubah Data Penilaian';
        document.getElementById('btnSave').textContent = 'Update Data';
        document.getElementById('btnCancel').style.display = 'inline-block';
        document.getElementById('formContainer').scrollIntoView({ behavior: 'smooth' });
    };
    
    window.cancelEdit = () => {
        document.getElementById('penilaianForm').reset();
        aspekPenilaian.forEach(item => { document.getElementById(`predikat_${item.id}`).textContent = '-'; });
        document.getElementById('penilaianId').value = '';
        document.getElementById('formLegend').textContent = 'Formulir Penilaian Baru';
        document.getElementById('btnSave').textContent = 'Simpan Penilaian';
        document.getElementById('btnCancel').style.display = 'none';
        calculateTotal();
    };

    window.deletePenilaian = async (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data penilaian ini?')) {
            await penilaianCollection.doc(id).delete();
            alert('Data berhasil dihapus.');
            loadPenilaian();
        }
    };

    window.showDetail = async (id) => {
        const doc = await penilaianCollection.doc(id).get();
        if (!doc.exists) return;
        const item = doc.data();
        const modalBody = document.getElementById('modalBody');

        let aspekHtml = '';
        item.aspek.forEach(aspek => {
            aspekHtml += `<tr><td>${aspek.aspek}</td><td>${aspek.kegiatan}</td><td>${aspek.nilai}</td><td>${aspek.predikat}</td></tr>`;
        });

        modalBody.innerHTML = `
            <h2>Detail Penilaian LKM</h2>
            <table class="detail-table">
                <tr><td><strong>Topik</strong></td><td>${item.topik}</td></tr>
                <tr><td><strong>Tujuan</strong></td><td>${item.tujuanPembelajaran}</td></tr>
                <tr><td><strong>Kelas</strong></td><td>${item.kelas}</td></tr>
                <tr><td><strong>Kelompok</strong></td><td>${item.namaKelompok}</td></tr>
                <tr><td><strong>Tanggal</strong></td><td>${new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td></tr>
                <tr><td colspan="2"><strong>Nama Siswa:</strong></td></tr>
                <tr><td colspan="2"><pre class="student-list">${item.namaSiswa}</pre></td></tr>
            </table>
            <h3>Aspek yang Dinilai</h3>
            <table style="width:100%; border-collapse:collapse;">
                <thead><tr><th>Aspek</th><th>Kegiatan</th><th>Nilai</th><th>Predikat</th></tr></thead>
                <tbody>${aspekHtml}</tbody>
            </table>
            <div class="total-score">Total Akumulasi Nilai Predikat: <span>${item.rataRata} (${item.predikatAkhir})</span></div>
            <button class="no-print btn-primary" style="margin-top:20px;" onclick="window.print()">Cetak</button>`;
        modal.style.display = 'block';
    };

    window.closeModal = () => { modal.style.display = 'none'; };
    window.onclick = (event) => { if (event.target == modal) { closeModal(); } };
    
    // Inisialisasi Aplikasi
    const initApp = () => {
        generateAspekTable();
        loadPenilaian();
        calculateTotal();
        document.getElementById('filterKelas').addEventListener('change', loadPenilaian);
        document.getElementById('btnCancel').addEventListener('click', cancelEdit);
    };
    
    checkLoginStatus(); // Jalankan pengecekan saat halaman pertama kali dimuat
});