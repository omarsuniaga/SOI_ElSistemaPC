/**
 * Utility to completely disable pull-to-refresh gestures
 * and browser bouncing (rubber-banding) on mobile (iOS/Android)
 * and touch-enabled desktop devices.
 */
export function disablePullToRefresh() {
  let touchStartClientY = 0;

  document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartClientY = e.touches[0].clientY;
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;

    const touchCurrentClientY = e.touches[0].clientY;
    const touchDeltaY = touchCurrentClientY - touchStartClientY;

    // Check if swiping DOWN (positive delta)
    if (touchDeltaY > 0) {
      let target = e.target;
      let isScrollableContainerAtTop = false;
      let foundScrollableParent = false;

      // Climb up the DOM tree to see if swiping inside a scrollable element
      while (target && target !== document.body && target !== document.documentElement) {
        // SVG nodes or special nodes might not have window.getComputedStyle or parentNode in old specs
        if (target.nodeType !== Node.ELEMENT_NODE) {
          target = target.parentNode;
          continue;
        }

        const style = window.getComputedStyle(target);
        if (!style) {
          target = target.parentNode;
          continue;
        }

        const overflowY = style.overflowY;
        const isScrollable = overflowY === 'auto' || overflowY === 'scroll';

        // Element is scrollable and actually has scrollable overflow content
        if (isScrollable && target.scrollHeight > target.clientHeight) {
          foundScrollableParent = true;
          // If we are at the top, prevent bubbling down further
          if (target.scrollTop <= 0) {
            isScrollableContainerAtTop = true;
          }
          break; // Found the inner container, stop ascending
        }
        target = target.parentNode;
      }

      // If swiping directly on the body / no inner scrollable element, check page root scroll
      if (!foundScrollableParent) {
        const rootScrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
        if (rootScrollTop <= 0) {
          isScrollableContainerAtTop = true;
        }
      }

      // Block gesture if container is scrolled to the absolute top to avoid pull-to-refresh
      if (isScrollableContainerAtTop) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    }
  }, { passive: false });
}
