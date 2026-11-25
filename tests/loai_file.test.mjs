// Kiểm thử suy loại file theo đuôi và giới hạn 30 MB (loai-file.js), dùng cho ô chọn file của chat.
// Không gọi mạng. Chạy từ thư mục gốc repo: node --test tests/*.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { GIOI_HAN_MOI_FILE, LOAI_THEO_DUOI, loaiFile, loaiDuocGui, loiCoGioiHan } = require(fileURLToPath(new URL('../loai-file.js', import.meta.url)));

const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

test('bảng đuôi: pdf, docx, pptx, xlsx, csv và ảnh đúng loại MIME', () => {
  assert.equal(LOAI_THEO_DUOI.pdf, 'application/pdf');
  assert.equal(LOAI_THEO_DUOI.docx, DOCX);
  assert.equal(LOAI_THEO_DUOI.pptx, PPTX);
  assert.equal(LOAI_THEO_DUOI.xlsx, XLSX);
  assert.equal(LOAI_THEO_DUOI.csv, 'text/csv');
  assert.equal(LOAI_THEO_DUOI.jpg, 'image/jpeg');
});

test('trình duyệt không cho loại (rỗng): suy từ đuôi, không rơi về application/pdf', () => {
  assert.equal(loaiFile('Hop dong.docx', ''), DOCX);
  assert.equal(loaiFile('Trinh bay.PPTX', ''), PPTX);
  assert.equal(loaiFile('bang.xlsx', ''), XLSX);
  assert.equal(loaiFile('so.csv', ''), 'text/csv');
});

test('trình duyệt đưa loại chung (application/octet-stream, zip): cũng suy từ đuôi', () => {
  assert.equal(loaiFile('tai-lieu.docx', 'application/octet-stream'), DOCX);
  assert.equal(loaiFile('slide.pptx', 'application/zip'), PPTX);
});

test('trình duyệt đã cho loại rõ ràng: giữ nguyên loại gốc', () => {
  assert.equal(loaiFile('anh.png', 'image/png'), 'image/png');
  assert.equal(loaiFile('IFU.pdf', 'application/pdf'), 'application/pdf');
});

test('đuôi lạ và không có loại: trả application/octet-stream (không đoán thành PDF)', () => {
  assert.equal(loaiFile('file.zip', ''), 'application/octet-stream');
  assert.equal(loaiFile('khong-duoi', ''), 'application/octet-stream');
});

test('loaiDuocGui: nhận PDF, ảnh, CSV, DOCX, PPTX, XLSX; từ chối loại khác', () => {
  for (const [loai, ten] of [['application/pdf', 'a.pdf'], ['image/jpeg', 'a.jpg'], ['text/csv', 'a.csv'], [DOCX, 'a.docx'], [PPTX, 'a.pptx'], [XLSX, 'a.xlsx']]) {
    assert.equal(loaiDuocGui(loai, ten), true, loai);
  }
  assert.equal(loaiDuocGui('application/octet-stream', 'a.zip'), false);
  assert.equal(loaiDuocGui('application/msword', 'a.doc'), false);
});

test('giới hạn 30 MB: file đúng 30 MB được nhận, file vượt thì báo rõ tên và dung lượng', () => {
  assert.equal(GIOI_HAN_MOI_FILE, 30 * 1024 * 1024);
  assert.equal(loiCoGioiHan('ok.pdf', GIOI_HAN_MOI_FILE), '');
  const loi = loiCoGioiHan('lon.docx', GIOI_HAN_MOI_FILE + 1);
  assert.ok(loi.includes('lon.docx'));
  assert.ok(loi.includes('30 MB'));
  assert.ok(loi.includes('30.0 MB'));
});
