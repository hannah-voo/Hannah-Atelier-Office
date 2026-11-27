// Kiểm tra logic menu lệnh "/" (lenh.js): lọc theo agent, chỉ hiện khi "/" đầu câu, không hiện giữa câu.
// Chỉ đọc lenh.js trong repo này, không gọi mạng. Chạy từ thư mục gốc repo: node --test tests/*.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { LENH_THEO_AGENT, locLenh } = require(fileURLToPath(new URL('../lenh.js', import.meta.url)));
const SOL = 'cmd-03';
const ORBIT = 'cmd-04';
const AI_AGENT = 'bq-08'; // agent AI, không có lệnh trong danh sách

const ten = (ds) => ds.map((l) => l.ten);

test('Sol: gõ "/" hiện /nhac và các lệnh /doi (mọi agent đều có /doi)', () => {
  assert.deepEqual(ten(locLenh(SOL, '/')), ['/nhac', '/doi gemini', '/doi haiku', '/doi sonnet', '/doi deepseek']);
});

test('Sol: gõ "/na" lọc còn /nhac (khớp rời, vì /nhac không bắt đầu bằng na); không phân biệt hoa thường', () => {
  assert.deepEqual(ten(locLenh(SOL, '/na')), ['/nhac']);
  assert.deepEqual(ten(locLenh(SOL, '/nh')), ['/nhac']);
  assert.deepEqual(ten(locLenh(SOL, '/NA')), ['/nhac']);
});

test('Orbit: gõ "/" hiện /bao-cao-ads và /doi, và "/bao" lọc đúng', () => {
  assert.deepEqual(ten(locLenh(ORBIT, '/')), ['/bao-cao-ads', '/doi gemini', '/doi haiku', '/doi sonnet', '/doi deepseek']);
  assert.deepEqual(ten(locLenh(ORBIT, '/bao')), ['/bao-cao-ads']);
  assert.deepEqual(ten(locLenh(ORBIT, '/nhac')), []);
});

test('mô tả đúng như yêu cầu', () => {
  assert.equal(LENH_THEO_AGENT[SOL][0].mo_ta, 'Đặt nhắc việc. Ví dụ: /nhac 15:00 gọi khách Lan');
  assert.equal(LENH_THEO_AGENT[ORBIT][0].mo_ta, 'Báo cáo ads theo brand và tháng. Ví dụ: /bao-cao-ads asia-new-vision 11/2026');
});

test('agent AI không có lệnh riêng: gõ "/" chỉ hiện các lệnh /doi; không có agent thì không hiện menu', () => {
  assert.deepEqual(ten(locLenh(AI_AGENT, '/')), ['/doi gemini', '/doi haiku', '/doi sonnet', '/doi deepseek']);
  assert.deepEqual(locLenh(undefined, '/'), []);
});

test('/doi: gõ "/doi" hiện đủ 4 model; đã gõ khoảng trắng thì menu đóng', () => {
  assert.deepEqual(ten(locLenh(AI_AGENT, '/doi')), ['/doi gemini', '/doi haiku', '/doi sonnet', '/doi deepseek']);
  assert.deepEqual(locLenh(AI_AGENT, '/doi '), []);
  assert.deepEqual(locLenh(AI_AGENT, '/doi gemini'), []);
});

test('"/" giữa câu không bật menu (link, ngày tháng, chữ thường)', () => {
  assert.deepEqual(locLenh(SOL, 'a/b'), []);
  assert.deepEqual(locLenh(SOL, 'xem link https://example.com/x'), []);
  assert.deepEqual(locLenh(SOL, 'ngày 11/2026'), []);
  assert.deepEqual(locLenh(SOL, 'nhắc mình /na'), []);
});

test('đã gõ khoảng trắng sau tên lệnh thì menu đóng (đang nhập tham số)', () => {
  assert.deepEqual(locLenh(SOL, '/nhac '), []);
  assert.deepEqual(locLenh(SOL, '/nhac 15:00 gọi'), []);
});

test('khớp rời không khớp khi thiếu chữ: "/bcads" khớp /bao-cao-ads, "/zz" không khớp', () => {
  assert.deepEqual(ten(locLenh(ORBIT, '/bcads')), ['/bao-cao-ads']);
  assert.deepEqual(ten(locLenh(ORBIT, '/zz')), []);
});

test('lệnh không khớp và câu nói thường: không hiện menu', () => {
  assert.deepEqual(locLenh(SOL, '/xyz'), []);
  assert.deepEqual(locLenh(SOL, 'nhắc mình 15:00'), []);
  assert.deepEqual(locLenh(SOL, ''), []);
  assert.deepEqual(locLenh(SOL, null), []);
});
