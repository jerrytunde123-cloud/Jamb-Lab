/**
 * JAMB Quiz - seen tracker tests.
 */

import { addSeen, clearSeen, getSeen } from '../js/seen.js';

describe('seen tracker', function() {
  beforeEach(function() {
    window.localStorage.clear();
  });

  it('starts empty and remembers served ids per subject', function() {
    expect(getSeen('physics')).toEqual([]);
    addSeen('physics', ['a', 'b']);
    expect(getSeen('physics')).toEqual(['a', 'b']);
    expect(getSeen('chemistry')).toEqual([]);
  });

  it('ignores junk and survives corrupt storage', function() {
    addSeen(null, ['a']);
    addSeen('physics', []);
    addSeen('physics', null);
    expect(getSeen('physics')).toEqual([]);
    window.localStorage.setItem('jamb_seen_v1', 'not-json{{{');
    expect(getSeen('physics')).toEqual([]);
  });

  it('clears one subject without touching others', function() {
    addSeen('physics', ['a']);
    addSeen('chemistry', ['b']);
    clearSeen('physics');
    expect(getSeen('physics')).toEqual([]);
    expect(getSeen('chemistry')).toEqual(['b']);
  });
});
