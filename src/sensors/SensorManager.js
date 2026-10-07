export class SensorManager {
  // Physical sensors are reserved for V0.2; the game reads this neutral adapter.
  getOrientation() { return { x: 0, y: 0 }; }
  getMotion() { return { x: 0, y: 0, z: 0 }; }
  getShakeIntensity() { return 0; }
  get mode() { return 'TOUCH'; }
}
