import { useEffect } from 'react';

export interface KeyboardShortcut {
  /** Key to listen for (e.g., '/', 'Escape', 't') */
  key: string;
  /** Optional modifier(s) */
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  /** Handler to call */
  handler: () => void;
  /** Description for documentation */
  description: string;
}

/**
 * Registers global keyboard shortcuts.
 * Automatically skips when focus is in an input, textarea, or select
 * (except for 'Escape' which always fires).
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]): void {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Skip when focused in form elements (except Escape)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      for (const shortcut of shortcuts) {
        if (e.key !== shortcut.key) continue;
        if (shortcut.ctrlKey && !e.ctrlKey) continue;
        if (shortcut.metaKey && !e.metaKey) continue;
        if (shortcut.shiftKey && !e.shiftKey) continue;

        // Allow Escape in any context; block others in form fields
        if (isInput && e.key !== 'Escape') continue;

        e.preventDefault();
        shortcut.handler();
        return;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [shortcuts]);
}
