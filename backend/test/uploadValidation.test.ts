import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateImageContent } from '../src/uploadValidation';

test('accepts matching raster image signatures', () => {
  assert.ok(validateImageContent('.png', Buffer.from([137,80,78,71,13,10,26,10,0])));
  assert.ok(validateImageContent('.jpg', Buffer.from([0xff,0xd8,0xff,0xdb])));
  assert.ok(validateImageContent('.webp', Buffer.from('RIFF0000WEBP!')));
});

test('rejects mismatched or unsupported file signatures', () => {
  assert.equal(validateImageContent('.png', Buffer.from('<svg/>')), null);
  assert.equal(validateImageContent('.exe', Buffer.from('MZ')), null);
  assert.equal(validateImageContent('.webp', Buffer.from('RIFF0000PNG!')), null);
});

test('rejects unsafe SVG markup and strips harmless XML declarations', () => {
  assert.equal(validateImageContent('.svg', Buffer.from('<svg onload="alert(1)"></svg>')), null);
  assert.equal(validateImageContent('.svg', Buffer.from('<svg><script>alert(1)</script></svg>')), null);
  assert.equal(validateImageContent('.svg', Buffer.from('<svg><image href="https://evil.test/a.png"/></svg>')), null);
  const safe = validateImageContent('.svg', Buffer.from('<?xml version="1.0"?><svg viewBox="0 0 1 1"></svg>'));
  assert.equal(safe?.toString(), '<svg viewBox="0 0 1 1"></svg>');
});
