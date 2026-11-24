// Kiểm tra agents.json (nguồn AGENTS_URL): cấu trúc entry, không trùng id, và hai agent Planning mới.
// Chỉ đọc file trong repo này, không gọi mạng.
// Chạy từ thư mục gốc repo: node --test tests/*.mjs
// Lưu ý: kiểm tra "mọi agent có ID kiểm kê trong agents/ đều có entry" cần đọc repo Hannah-Atelier, nên không nằm ở đây.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const RAW = readFileSync(fileURLToPath(new URL('../agents.json', import.meta.url)), 'utf8');
const DATA = JSON.parse(RAW);
const AGENTS = DATA.agents;

const TRUONG_BAT_BUOC = ['id', 'dept', 'sub', 'order', 'name', 'role', 'greet', 'status', 'title'];

test('agents.json là JSON hợp lệ và có mảng agents', () => {
  assert.ok(Array.isArray(AGENTS));
  assert.ok(AGENTS.length > 0);
});

test('không có id trùng', () => {
  const ids = AGENTS.map((a) => a.id);
  const trung = ids.filter((x, i) => ids.indexOf(x) !== i);
  assert.deepEqual(trung, []);
});

test('mọi entry có đủ các trường bắt buộc', () => {
  for (const a of AGENTS) {
    for (const t of TRUONG_BAT_BUOC) {
      assert.ok(a[t] !== undefined && a[t] !== '', `${a.id || '(không id)'} thiếu trường ${t}`);
    }
  }
});

test('có entry mka-33 (Vesta) và el-34 (Pearl) đúng trường', () => {
  const vesta = AGENTS.find((a) => a.id === 'mka-33');
  const pearl = AGENTS.find((a) => a.id === 'el-34');
  assert.ok(vesta, 'thiếu mka-33');
  assert.ok(pearl, 'thiếu el-34');
  assert.equal(vesta.dept, 'mka');
  assert.equal(vesta.name, 'Vesta');
  assert.equal(vesta.title, 'Planning');
  assert.equal(pearl.dept, 'el');
  assert.equal(pearl.name, 'Pearl');
  assert.equal(pearl.title, 'Planning');
  assert.equal(vesta.role, pearl.role, 'role của Vesta và Pearl phải giống nhau');
});

test('role của Vesta và Pearl không chứa câu cấm đổi ngân sách đã bỏ', () => {
  for (const id of ['mka-33', 'el-34']) {
    const a = AGENTS.find((x) => x.id === id);
    assert.doesNotMatch(a.role, /Không đề xuất đổi ngân sách/);
  }
});
