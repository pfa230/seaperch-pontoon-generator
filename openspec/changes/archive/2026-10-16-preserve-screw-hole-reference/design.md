# Design

Keep the pivot at the tangent nose sphere centre, c = L − r / sin 35°. The previous coaxial cone-to-mount flush reference is f = L − r / tan 35°. Measure the hole along the mount axis at distance 10 + f − c from the pivot, restoring its coaxial height to f + 10 while retaining the spherical joint. This is a fixed reference that tilts with the mount, not a calculation of actual pipe seating at every tilt.

At 0°, the default 0.2 mm diametral clearance puts the physical pipe or socket edge about 0.14 mm below this nominal reference. The hole therefore remains approximately 10.14 mm from that edge, as before the rounded-nose change. At tilted angles seating can occur earlier; the fixed reference does not promise exactly 10 mm from the physical edge at every angle.

The fitting cavity at 0° is now limited by the rounded nose: 161.57 + 10.57 − 1.2 ≈ 170.94 mm. Keep the cap below both the hole and nose to preserve wall thickness and the 35° cavity roof. This roof necessarily leaves thicker material near the rounded nose than an uncapped inward offset; estimated mass and lift continue to use the actual resulting solid.

Keep the existing 25 mm mount length measured from the sphere centre. Restoring its former usable insertion depth would be a separate dimension change. Reuse the existing fixed hole setting and mount-axis calculation without introducing a new input, state field or positioning abstraction.
