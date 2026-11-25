// Loại file và giới hạn dung lượng cho file đính kèm chat (dùng trong index.html).
// Trình duyệt đôi khi không cho loại file (chuỗi rỗng hoặc application/octet-stream), khi đó suy loại từ đuôi file.
// Không gán mặc định application/pdf cho file không rõ loại: làm vậy DOCX bị gửi nhầm thành PDF.
// Chạy kiểm thử: node --test tests/*.mjs
(function (root) {
  const GIOI_HAN_MOI_FILE = 10 * 1024 * 1024; // 10 MB mỗi file
  const LOAI_THEO_DUOI = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif'
  };
  // Loại mà trình duyệt đưa ra không đáng tin: coi như chưa có
  const LOAI_KHONG_RO = ['', 'application/octet-stream', 'application/zip', 'application/x-zip-compressed'];

  function duoiCuaTen(ten) {
    const m = String(ten || '').toLowerCase().match(/\.([a-z0-9]+)$/);
    return m ? m[1] : '';
  }

  // Trả loại MIME của file: giữ loại trình duyệt nếu rõ; nếu không rõ thì suy từ đuôi. Đuôi lạ và không có loại thì trả application/octet-stream để Worker từ chối rõ ràng.
  function loaiFile(ten, loaiTrinhDuyet) {
    const loai = String(loaiTrinhDuyet || '').toLowerCase();
    if (!LOAI_KHONG_RO.includes(loai)) return loai;
    return LOAI_THEO_DUOI[duoiCuaTen(ten)] || 'application/octet-stream';
  }

  // Các loại Worker nhận: PDF, ảnh (png, jpeg, webp, gif), CSV, DOCX, PPTX, XLSX.
  function loaiDuocGui(loai, ten) {
    if (/^image\/(png|jpeg|webp|gif)$/.test(loai)) return true;
    if (['application/pdf', 'text/csv'].includes(loai)) return true;
    if ([LOAI_THEO_DUOI.docx, LOAI_THEO_DUOI.pptx, LOAI_THEO_DUOI.xlsx].includes(loai)) return true;
    return /\.csv$/i.test(String(ten || ''));
  }

  // Thông báo khi file vượt 10 MB, hoặc '' nếu được.
  function loiCoGioiHan(ten, dungLuong) {
    if (dungLuong <= GIOI_HAN_MOI_FILE) return '';
    return 'File ' + (ten || '') + ' quá lớn (' + (dungLuong / 1048576).toFixed(1) + ' MB). Tối đa 10 MB mỗi file, Hannah nén hoặc tách file nhé.';
  }

  const api = { GIOI_HAN_MOI_FILE, LOAI_THEO_DUOI, loaiFile, loaiDuocGui, loiCoGioiHan };
  root.LOAI_FILE = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
