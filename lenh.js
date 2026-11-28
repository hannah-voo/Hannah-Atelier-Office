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
  // /doi đổi model tạm thời 24 giờ, áp dụng cho mọi agent (Worker xử lý). Menu liệt kê từng model.
  const LENH_DOI = [
    { ten: '/doi gemini', mo_ta: 'Đổi tạm thời sang Gemini trong 24 giờ' },
    { ten: '/doi haiku', mo_ta: 'Đổi tạm thời sang Claude Haiku 5.5 trong 24 giờ' },
    { ten: '/doi sonnet', mo_ta: 'Đổi tạm thời sang Claude Sonnet 5.5 trong 24 giờ' },
    { ten: '/doi deepseek', mo_ta: 'Đổi tạm thời sang DeepSeek trong 24 giờ' },
    { ten: '/doi VertexAI', mo_ta: 'Đổi tạm thời sang Gemini qua Vertex (credit Google Cloud) trong 24 giờ, đến 18/02/2027' }
  ];
  // Lệnh riêng của agent, rồi đến các lệnh /doi dùng chung. Không có agent thì không có menu.
  function danhSachCua(agentId) {
    if (!agentId) return [];
    return [...(LENH_THEO_AGENT[agentId] || []), ...LENH_DOI];
  }
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
    const ds = danhSachCua(agentId);
    const qs = q.toLowerCase();
    // Khớp đầu từ trước, sau đó khớp rời (các chữ gõ nằm đúng thứ tự trong tên): "/na" khớp "/nhac"
    const ten = (l) => l.ten.slice(1).toLowerCase();
    const dau = ds.filter((l) => ten(l).startsWith(qs));
    const roi = ds.filter((l) => !dau.includes(l) && khopRoi(ten(l), qs));
    return [...dau, ...roi];
  }
  const api = { LENH_THEO_AGENT, LENH_DOI, locLenh };
  root.LENH = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
