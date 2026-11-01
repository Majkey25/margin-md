import assert from 'node:assert/strict';
import test from 'node:test';
import { messages, resolveLocale, translate, type MessageKey } from '../src/i18n';

test('resolves device languages, unsupported languages and explicit choices', () => {
  assert.equal(resolveLocale('system', ['fr-FR', 'de-AT', 'en-US']), 'de');
  assert.equal(resolveLocale(null, ['cs-CZ']), 'cs');
  assert.equal(resolveLocale('invalid', ['fr-FR', 'en-US']), 'en');
  assert.equal(resolveLocale('system', ['ja-JP']), 'en');
  assert.equal(resolveLocale('system', []), 'en');
  assert.equal(resolveLocale('cs', ['de-DE']), 'cs');
  assert.equal(resolveLocale('de', ['cs-CZ']), 'de');
});

test('English and German catalogs cover every Czech key and retain placeholders', () => {
  const keys = Object.keys(messages.en) as MessageKey[];
  assert.deepEqual(Object.keys(messages.de).sort(), [...keys].sort());
  for (const key of keys) {
    const placeholders = (text: string) => [...text.matchAll(/\{\w+\}/g)].map((match) => match[0]).sort();
    assert.deepEqual(placeholders(messages.en[key]), placeholders(key), `English: ${key}`);
    assert.deepEqual(placeholders(messages.de[key]), placeholders(key), `German: ${key}`);
    assert.equal(translate('cs', key), key);
  }
});

test('formats dynamic paths as plain text without changing their content', () => {
  const name = '<script>"x"</script>/poznámky.md';
  for (const locale of ['cs', 'en', 'de'] as const) {
    const result = translate(locale, '{name} bude nahrazen aktuálním textem.', { name });
    assert.ok(result.includes(name));
    assert.equal(result.includes('{name}'), false);
  }
});
