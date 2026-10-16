// Mount length in mm, measured from the mount's start point along its axis.
// Must stay at least the fitting mount's radius so it covers the rounded
// nose at 0°.
export const MOUNT_LENGTH = 25;

// Fit clearance in mm, taken off the mount's nominal diameter.
export const FIT_CLEARANCE = 0.2;

// Screw hole diameter in mm, for an M3 screw.
export const HOLE_DIAMETER = 3.2;

// Distance in mm along the mount from the nominal cone-to-mount flush
// reference to the screw hole's axis. The reference tilts with the mount.
export const HOLE_FROM_START = 10;
