// Danh sách lệnh gợi ý theo agent (một file cấu hình duy nhất cho menu "/" trong chat).
// Thêm hoặc sửa lệnh chỉ cần sửa file này. Lệnh không có trong danh sách thì agent đó không hiện menu.
// Tên lệnh phải khớp với lệnh mà Worker xử lý (worker/live/worker.js, bộ xử lý lệnh mã A).
(function (root) {
  const LENH_THEO_AGENT = {
    'cmd-03': [
      { ten: '/nhac', mo_ta: 'Đặt nhắc việc. Ví dụ: /nhac 15:00 gọi khách Lan' }
    ],
    'cmd-04': [
      { ten: '/bao-cao-ads', mo_ta: 'Báo cáo ads theo brand và tháng. Ví dụ: /bao-cao-ads asia-new-vision 11/2026' }
    ]
  };
  function khopRoi(ten, q) {
    let i = 0;
    for (const c of ten) { if (i < q.length && c === q[i]) i++; }
    return i === q.length;
  }
  // Trả danh sách lệnh khớp với ô nhập. Menu chỉ hiện khi ô bắt đầu bằng "/" và chưa có khoảng trắng sau tên lệnh.
  function locLenh(agentId, text) {
    const v = String(text == null ? '' : text);
    if (!v.startsWith('/')) return [];
    const q = v.slice(1);
    if (/\s/.test(q)) return [];
    const ds = LENH_THEO_AGENT[agentId] || [];
    const qs = q.toLowerCase();
    // Khớp đầu từ trước, sau đó khớp rời (các chữ gõ nằm đúng thứ tự trong tên): "/na" khớp "/nhac"
    const ten = (l) => l.ten.slice(1).toLowerCase();
    const dau = ds.filter((l) => ten(l).startsWith(qs));
    const roi = ds.filter((l) => !dau.includes(l) && khopRoi(ten(l), qs));
    return [...dau, ...roi];
  }
  const api = { LENH_THEO_AGENT, locLenh };
  root.LENH = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
