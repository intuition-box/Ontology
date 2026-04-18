import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from '../lib/use-local-storage';
import { TUTORIAL_AUTOSHOW_DELAY_MS, TUTORIAL_SCROLL_SETTLE_MS } from '../lib/timings';

interface TutorialStep {
  targetSelector: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    targetSelector: '[data-tutorial-step="claim-builder"]',
    title: 'Build Claims',
    description:
      'Start here: enter a subject, pick a predicate, and specify an object to construct a valid triple. Save claims to history or batch them for export.',
  },
  {
    targetSelector: '[data-tutorial-step="entity-schema"]',
    title: 'Entity Schema & Hierarchy',
    description:
      'Select an entity type to view its onchain fields and JSON-LD schema. The hierarchy tree shows how all entity types relate via Schema inheritance.',
  },
  {
    targetSelector: '[data-tutorial-step="predicate-explorer"]',
    title: 'Predicate Explorer',
    description:
      'Select any of the predicates to see all valid entity pairs it connects. Click a pair to fill the Claim Builder instantly.',
    position: 'top',
  },
  {
    targetSelector: '[data-tutorial-step="entity-matrix-link"]',
    title: 'Entity Matrix',
    description:
      'Navigate to the Entity Matrix page to browse all valid entity type combinations. Each row shows a Subject → DefinedTerm → Object triple.',
  },
];

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialOverlay({ isOpen, onClose }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const step = TUTORIAL_STEPS[currentStep];

  // Position tooltip relative to target
  useEffect(() => {
    if (!isOpen || !step) return;

    const target = document.querySelector(step.targetSelector);
    if (!target) {
      setTargetRect(null);
      return;
    }

    // Scroll target into view
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Wait for smooth scroll to settle before measuring the target rect.
    const timeout = setTimeout(() => {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);
    }, TUTORIAL_SCROLL_SETTLE_MS);

    return () => clearTimeout(timeout);
  }, [isOpen, currentStep, step]);

  const handleNext = useCallback(() => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  }, [currentStep, onClose]);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const handleSkip = useCallback(() => {
    onClose();
    setCurrentStep(0);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, handleSkip]);

  if (!isOpen) return null;

  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[100]" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 transition-opacity"
        onClick={handleSkip}
        style={{
          clipPath: targetRect
            ? `polygon(
                0% 0%, 0% 100%,
                ${targetRect.left - 8}px 100%,
                ${targetRect.left - 8}px ${targetRect.top - 8}px,
                ${targetRect.right + 8}px ${targetRect.top - 8}px,
                ${targetRect.right + 8}px ${targetRect.bottom + 8}px,
                ${targetRect.left - 8}px ${targetRect.bottom + 8}px,
                ${targetRect.left - 8}px 100%,
                100% 100%, 100% 0%
              )`
            : undefined,
        }}
      />

      {/* Highlight border */}
      {targetRect && (
        <div
          className="absolute rounded-xl border-2 border-[var(--color-accent)] pointer-events-none"
          style={{
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="absolute z-10 w-80 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xl"
        style={{
          left: targetRect
            ? Math.min(targetRect.left, window.innerWidth - 340)
            : '50%',
          ...(targetRect
            ? step?.position === 'top'
              ? { bottom: window.innerHeight - targetRect.top + 20 }
              : { top: targetRect.bottom + 20 }
            : { top: '50%', transform: 'translate(-50%, -50%)' }),
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            {step?.title}
          </h3>
          <span className="text-xs text-[var(--color-text-muted)]">
            {currentStep + 1} / {TUTORIAL_STEPS.length}
          </span>
        </div>

        <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
          {step?.description}
        </p>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {TUTORIAL_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentStep
                  ? 'w-4 bg-[var(--color-accent)]'
                  : i < currentStep
                    ? 'w-1.5 bg-[var(--color-accent)]/50'
                    : 'w-1.5 bg-[var(--color-border)]'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="focus-ring rounded-md px-2 py-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            Skip
          </button>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="focus-ring rounded-md px-3 py-1.5 text-xs font-medium bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="focus-ring rounded-md px-3 py-1.5 text-xs font-medium bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              {isLastStep ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Hook that manages tutorial visibility (auto-show on first visit) */
export function useTutorial() {
  const [seen, setSeen] = useLocalStorage('ontology-tutorial-seen', false);
  const [isOpen, setIsOpen] = useState(false);

  // Auto-show on first visit
  useEffect(() => {
    if (!seen) {
      const timeout = setTimeout(() => setIsOpen(true), TUTORIAL_AUTOSHOW_DELAY_MS);
      return () => clearTimeout(timeout);
    }
  }, [seen]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setSeen(true);
  }, [setSeen]);

  return { isOpen, open, close };
}
