/**
 * A small spring, parameterised the way Apple's design talks describe it:
 * - dampingRatio: 1 settles without overshoot; below 1 overshoots (bouncier).
 * - response: roughly how long (s) the value takes to get there. Not a fixed duration.
 * A spring starts from the current value with the current velocity, so a new target
 * mid-flight bends the motion instead of restarting it.
 */
export type SpringOptions = { dampingRatio: number; response: number };

export class Spring {
  value: number;
  velocity = 0;
  target: number;
  private stiffness = 0;
  private damping = 0;

  constructor(value: number, options: SpringOptions) {
    this.value = value;
    this.target = value;
    this.configure(options);
  }

  configure({ dampingRatio, response }: SpringOptions) {
    // Mass 1: stiffness from the period, damping from the ratio.
    this.stiffness = (2 * Math.PI / response) ** 2;
    this.damping = (4 * Math.PI * dampingRatio) / response;
  }

  /** Advance by dt seconds (semi-implicit Euler in small steps, stable at any frame rate). */
  step(dt: number) {
    const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      const force = -this.stiffness * (this.value - this.target) - this.damping * this.velocity;
      this.velocity += force * h;
      this.value += this.velocity * h;
    }
  }

  get settled() {
    return Math.abs(this.velocity) < 0.5 && Math.abs(this.value - this.target) < 0.25;
  }
}

/**
 * Where a flick would come to rest, like scroll deceleration (the projection from Apple's
 * "Designing Fluid Interfaces"). velocity in px/s.
 */
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Past a boundary, follow less and less: resistance rather than a wall. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  const sign = Math.sign(overshoot);
  const distance = Math.abs(overshoot);
  return (sign * (distance * dimension * constant)) / (dimension + constant * distance);
}
