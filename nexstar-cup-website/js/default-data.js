// Data contoh untuk preview sebelum Firebase dihubungkan.
// Setelah Firestore aktif, data anggota diambil dari collection "members".
export const defaultMembers = Array.from({ length: 10 }, (_, index) => ({
  id: `sample-${index + 1}`,
  name: `Anggota ${String(index + 1).padStart(2, "0")}`,
  description: "Profil anggota Nexstar Cup akan diperbarui.",
  imageUrl: ""
}));
