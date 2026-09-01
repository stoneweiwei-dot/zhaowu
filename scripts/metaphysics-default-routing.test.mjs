import assert from 'node:assert/strict';
import test from 'node:test';
import { routeMethods } from '../src/lib/core/method.ts';

test('子平始终是命理主判，紫微只在资料就绪时进入现象验证', () => {
  const blocked = routeMethods('career', { ziweiReady: false, ziweiMissing: ['可靠出生時辰'] });
  assert.equal(blocked.primary.name, '子平八字');
  assert.equal(blocked.primary.role, '主判');
  assert.equal(blocked.selected[0].name, '紫微斗數');
  assert.equal(blocked.selected[0].status, '資料未接入');
  assert.match(blocked.routingReason, /不強排/);

  const ready = routeMethods('career', { ziweiReady: true });
  assert.equal(ready.primary.name, '子平八字');
  assert.equal(ready.selected[0].name, '紫微斗數');
  assert.equal(ready.selected[0].status, '已執行');
  assert.match(ready.selected[0].bound, /不替代子平/);
});

test('身心题启用紫微时仍锁定医疗边界', () => {
  const ready = routeMethods('health', { ziweiReady: true });
  assert.equal(ready.primary.name, '子平八字');
  assert.equal(ready.selected[0].name, '紫微斗數');
  assert.equal(ready.selected[0].status, '已執行');
  assert.match(ready.routingReason, /禁止疾病診斷/);
});

test('选择与时间题可使用紫微阶段验证，但不替代另起卦系统', () => {
  const protocol = routeMethods('choice', { ziweiReady: true });
  assert.equal(protocol.primary.name, '子平八字');
  assert.equal(protocol.selected[0].name, '紫微斗數');
  assert.equal(protocol.selected[0].status, '已執行');
  assert.match(protocol.routingReason, /六爻、大六壬.*另起卦／課/);
});
