/**
 * a11y-testing.js — Accessibility testing utilities for development
 * Run these checks during development to catch accessibility issues early
 */

/**
 * Check if all interactive elements have minimum touch target size
 * @param {number} minSize - Minimum size in pixels (default 44)
 * @returns {Array} Array of elements not meeting minimum size
 */
export function checkTouchTargets(minSize = 44) {
  const interactive = document.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="tab"]'
  );
  const violations = [];

  interactive.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width < minSize || rect.height < minSize) {
      violations.push({
        element: el,
        width: rect.width,
        height: rect.height,
        minSize,
      });
    }
  });

  return violations;
}

/**
 * Check for missing form labels
 * @returns {Array} Array of form controls without labels
 */
export function checkFormLabels() {
  const inputs = document.querySelectorAll('input, select, textarea');
  const violations = [];

  inputs.forEach((input) => {
    const id = input.id;
    const hasLabel = id && document.querySelector(`label[for="${id}"]`);
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');

    if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
      violations.push({
        element: input,
        type: input.type || input.tagName.toLowerCase(),
      });
    }
  });

  return violations;
}

/**
 * Check for focus indicators
 * @returns {boolean} True if focus indicators are properly styled
 */
export function checkFocusIndicators() {
  const testButton = document.createElement('button');
  testButton.className = 'focus-visible:ring-1';
  document.body.appendChild(testButton);

  const styles = window.getComputedStyle(testButton, ':focus-visible');
  const hasFocusStyle = styles.outline !== 'none' || styles.boxShadow !== 'none';

  testButton.remove();
  return hasFocusStyle;
}

/**
 * Check for semantic HTML structure
 * @returns {Array} Array of accessibility issues found
 */
export function checkSemanticHTML() {
  const issues = [];

  // Check for alt text on images
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      issues.push({
        type: 'Missing alt text',
        element: img,
        description: `Image missing alt attribute: ${img.src}`,
      });
    }
  });

  // Check for page title
  if (!document.title) {
    issues.push({
      type: 'Missing page title',
      description: 'Page should have a meaningful title tag',
    });
  }

  // Check for proper heading hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;
  headings.forEach((h) => {
    const level = parseInt(h.tagName[1]);
    if (level > lastLevel + 1) {
      issues.push({
        type: 'Broken heading hierarchy',
        element: h,
        description: `Heading jumped from H${lastLevel} to H${level}`,
      });
    }
    lastLevel = level;
  });

  return issues;
}

/**
 * Run all accessibility checks and log results
 */
export function runAccessibilityAudit() {
  console.group('🔍 Accessibility Audit');

  // Touch targets
  const touchTargets = checkTouchTargets();
  if (touchTargets.length === 0) {
    console.log('✅ All interactive elements meet 44px minimum touch target');
  } else {
    console.warn(`⚠️ ${touchTargets.length} elements below 44px touch target:`, touchTargets);
  }

  // Form labels
  const formLabels = checkFormLabels();
  if (formLabels.length === 0) {
    console.log('✅ All form inputs have associated labels');
  } else {
    console.warn(`⚠️ ${formLabels.length} form inputs missing labels:`, formLabels);
  }

  // Focus indicators
  const focusIndicators = checkFocusIndicators();
  if (focusIndicators) {
    console.log('✅ Focus indicators are properly styled');
  } else {
    console.warn('⚠️ Focus indicators may not be visible');
  }

  // Semantic HTML
  const semanticIssues = checkSemanticHTML();
  if (semanticIssues.length === 0) {
    console.log('✅ Semantic HTML structure is correct');
  } else {
    console.warn(`⚠️ ${semanticIssues.length} semantic HTML issues:`, semanticIssues);
  }

  console.groupEnd();
}

// Auto-run in development (optional)
if (import.meta.env.MODE === 'development' && typeof window !== 'undefined') {
  // Expose to console for manual testing
  window.__a11y = { checkTouchTargets, checkFormLabels, checkFocusIndicators, checkSemanticHTML, runAccessibilityAudit };
  console.log('🎯 Accessibility tools available: window.__a11y.runAccessibilityAudit()');
}