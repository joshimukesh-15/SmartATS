import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCandidateKeyboard } from './useCandidateKeyboard';

describe('useCandidateKeyboard hook', () => {
  let addEventListenerSpy;
  let removeEventListenerSpy;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers and unregisters keydown event listener', () => {
    const { unmount } = renderHook(() =>
      useCandidateKeyboard({ candidatesCount: 3, setSelectedIndex: vi.fn() })
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('advances index on ArrowDown and j keys', () => {
    const setSelectedIndex = vi.fn();
    renderHook(() =>
      useCandidateKeyboard({ candidatesCount: 5, setSelectedIndex })
    );

    const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    window.dispatchEvent(downEvent);
    expect(setSelectedIndex).toHaveBeenCalled();

    const updateFn = setSelectedIndex.mock.calls[0][0];
    expect(updateFn(1)).toBe(2);
    expect(updateFn(4)).toBe(4); // clamped at max

    setSelectedIndex.mockClear();

    const jEvent = new KeyboardEvent('keydown', { key: 'j' });
    window.dispatchEvent(jEvent);
    expect(setSelectedIndex).toHaveBeenCalled();
  });

  it('decrements index on ArrowUp and k keys', () => {
    const setSelectedIndex = vi.fn();
    renderHook(() =>
      useCandidateKeyboard({ candidatesCount: 5, setSelectedIndex })
    );

    const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    window.dispatchEvent(upEvent);
    expect(setSelectedIndex).toHaveBeenCalled();

    const updateFn = setSelectedIndex.mock.calls[0][0];
    expect(updateFn(2)).toBe(1);
    expect(updateFn(0)).toBe(0); // clamped at 0

    setSelectedIndex.mockClear();

    const kEvent = new KeyboardEvent('keydown', { key: 'k' });
    window.dispatchEvent(kEvent);
    expect(setSelectedIndex).toHaveBeenCalled();
  });

  it('triggers onEscape handler on Escape key', () => {
    const onEscape = vi.fn();
    renderHook(() =>
      useCandidateKeyboard({ onEscape })
    );

    const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    window.dispatchEvent(escEvent);
    expect(onEscape).toHaveBeenCalled();
  });

  it('ignores navigation when focused in an input element', () => {
    const setSelectedIndex = vi.fn();
    renderHook(() =>
      useCandidateKeyboard({ candidatesCount: 5, setSelectedIndex })
    );

    const input = document.createElement('input');
    document.body.appendChild(input);

    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
    Object.defineProperty(event, 'target', { value: input, enumerable: true });

    window.dispatchEvent(event);
    expect(setSelectedIndex).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });
});
