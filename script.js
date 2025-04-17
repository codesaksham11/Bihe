document.addEventListener('DOMContentLoaded', () => {
    const timelineProgress = document.querySelector('.timeline-progress');
    const events = document.querySelectorAll('.timeline-event');
    const markers = document.querySelectorAll('.event-marker');
    const timeline = document.querySelector('.timeline'); // Get the timeline wrapper

    // Ensure layout is calculated before getting offsets
    setTimeout(() => {
        // Calculate the total height needed for the progress bar
        // It should span from the center of the first marker to the center of the last marker
        const firstMarker = markers[0];
        const lastMarker = markers[markers.length - 1];

        if (!firstMarker || !lastMarker) return; // Exit if no markers found

        const timelineRect = timeline.getBoundingClientRect();
        const firstMarkerRect = firstMarker.getBoundingClientRect();
        const lastMarkerRect = lastMarker.getBoundingClientRect();

        // Calculate offsets relative to the timeline wrapper
        const startOffset = (firstMarkerRect.top + firstMarkerRect.height / 2) - timelineRect.top;
        const endOffset = (lastMarkerRect.top + lastMarkerRect.height / 2) - timelineRect.top;
        const totalProgressHeight = endOffset - startOffset;

        // Adjust path/progress positioning based on calculated offsets
        const path = document.querySelector('.timeline-path');
        if (path) {
            path.style.top = `${startOffset}px`;
            path.style.height = `${totalProgressHeight}px`; // Set actual height
            path.style.bottom = 'auto'; // Override bottom style
        }
        if (timelineProgress) {
             timelineProgress.style.top = `${startOffset}px`;
             timelineProgress.style.bottom = 'auto'; // Override bottom style
             timelineProgress.style.height = '0'; // Start at 0 height relative to the new dimensions
        }


        // Store marker vertical center positions relative to the startOffset
        const markerPositions = Array.from(markers).map(marker => {
            const markerRect = marker.getBoundingClientRect();
            const markerCenterY = (markerRect.top + markerRect.height / 2) - timelineRect.top;
            return markerCenterY - startOffset; // Position relative to the progress bar's start
        });

        // --- Animation Trigger ---
        // Use requestAnimationFrame for smoother animation checks
        let animationStartTime;
        const animationDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--animation-duration') || '15') * 1000; // Get duration from CSS in ms

        function animationStep(timestamp) {
            if (!animationStartTime) {
                animationStartTime = timestamp;
            }

            const elapsedTime = timestamp - animationStartTime;
            const progressRatio = Math.min(elapsedTime / animationDuration, 1); // Cap at 1 (100%)

            // Calculate the current height of the progress bar based on time
            const currentHeight = totalProgressHeight * progressRatio;
             if (timelineProgress) {
                 timelineProgress.style.height = `${currentHeight}px`;
             }


            // Check which markers have been reached
            markerPositions.forEach((markerPos, index) => {
                if (currentHeight >= markerPos && !events[index].classList.contains('active')) {
                    events[index].classList.add('active');
                }
            });

            // Continue the animation if not finished
            if (progressRatio < 1) {
                requestAnimationFrame(animationStep);
            } else {
                 // Ensure all markers are active at the very end (handles potential float inaccuracies)
                 events.forEach(event => event.classList.add('active'));
                 console.log("Timeline animation complete!");
            }
        }

        // Start the animation
        requestAnimationFrame(animationStep);

        // Add hover listeners (optional, but included in the request)
        events.forEach(event => {
            const marker = event.querySelector('.event-marker');
            if (marker) {
                marker.addEventListener('mouseenter', () => {
                    // Only allow hover effect if the event is active
                    if (event.classList.contains('active')) {
                       // The hover effect is handled by CSS :hover on .active .event-marker
                       // No extra class needed here unless you want a different *type* of hover effect via JS
                    }
                });
                // mouseleave effect is handled by CSS automatically
            }
        });

    }, 100); // Small delay to ensure rendering and layout calculation
});
