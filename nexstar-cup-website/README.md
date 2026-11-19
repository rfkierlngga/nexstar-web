# Nexstar Cup — Powered by Academic Helper

Website statis HTML, CSS, dan JavaScript dengan Firebase Authentication, Cloud Firestore, Firebase Storage, dan hosting Vercel.

## 1. Jalankan tampilan awal
- Buka folder ini di VS Code.
- Jalankan `index.html` menggunakan extension Live Server.
- Halaman publik menampilkan 10 data contoh sebelum Firebase dikonfigurasi.
- Login dan dashboard admin baru aktif setelah Firebase disiapkan.

## 2. Buat project Firebase
1. Buka https://console.firebase.google.com/ dan buat project.
2. Tambahkan aplikasi Web (ikon `</>`).
3. Salin konfigurasi aplikasi ke `js/firebase.js`, ganti semua nilai `ISI_...`.
4. Aktifkan Authentication > Sign-in method > Email/Password.
5. Buat user admin di Authentication > Users > Add user.
6. Salin UID user tersebut.
7. Buat Firestore Database dalam production mode.
8. Buat collection `admins`, lalu document ID harus sama persis dengan UID user.
9. Isi field `role` bertipe string dengan nilai `admin`.
10. Buat collection `members` (boleh kosong dulu).
11. Aktifkan Storage dan deploy aturan di `storage.rules`.

## 3. Pasang Firestore Rules
Firebase Console > Firestore Database > Rules. Salin isi `firestore.rules`, lalu Publish.

## 4. Pasang Storage Rules
Firebase Console > Storage > Rules. Salin isi `storage.rules`, lalu Publish.
Catatan: Storage Rules ini memakai akses Firestore untuk memeriksa dokumen admin. Jika Firebase meminta izin/konfigurasi penggunaan Firestore dari Storage Rules, ikuti petunjuk Firebase Console.

## 5. Isi konfigurasi Firebase
Buka `js/firebase.js`. Contoh bentuk konfigurasi (gunakan nilai asli dari Firebase Console):
- apiKey
- authDomain
- projectId
- storageBucket
- messagingSenderId
- appId

Jangan menaruh password admin di file JavaScript. Firebase Web API key bukan password; keamanan data ditegakkan melalui Authentication dan Security Rules.

## 6. Deploy ke Vercel
1. Upload project ke repository GitHub.
2. Login ke https://vercel.com/ dan pilih Add New > Project.
3. Import repository.
4. Framework Preset: Other.
5. Build Command dan Output Directory bisa dikosongkan untuk static site.
6. Deploy.
7. Di Firebase Authentication > Settings > Authorized domains, tambahkan domain Vercel milikmu.

## 7. Mengelola anggota
- Login melalui `login.html`.
- Dashboard menyediakan tambah, edit, hapus, upload foto/URL, dan tombol urut naik/turun.
- Data anggota disimpan di Firestore collection `members`.
- Foto yang diunggah disimpan di Firebase Storage.

## Catatan penting
- Data 10 anggota pada `js/default-data.js` hanya contoh tampilan awal, bukan data yang tersimpan di database.
- Isi anggota asli melalui dashboard admin atau ubah data contoh untuk preview.
- Jika collection Firestore masih kosong, halaman publik menampilkan data contoh.
- Jangan membuka akses tulis publik pada Firestore atau Storage.
