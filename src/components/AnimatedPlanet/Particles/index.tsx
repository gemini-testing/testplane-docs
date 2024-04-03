import clsx from "clsx";
import random from "lodash/random";
import styles from "./styles.module.scss";

interface ParticleData {
    size: number; // in px
    x: number; // in %
    y: number; // in %
}
const generateParticlesData = (): ParticleData[] => {
    const particles: ParticleData[] = [];

    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
        // We want particles to generate only on the lower half of the planet.
        const y = random(60, 95);

        // We don't want particles to overlap with the planet, hence generate them under an imaginary inclined line
        // See how it looks like on a plot: https://www.desmos.com/calculator/zf8q2faf3l
        const x = random(17, Math.min(2.1 * y - 110, 80));

        const size = random(4, 7, true);

        particles.push({ x, y, size });
    }

    return particles;
};

export function Particles() {
    const particlesData = generateParticlesData();
    const particles = particlesData.map(({ x, y, size }, index) => (
        <div
            className={clsx(styles.particle, "absolute bg-yellow-50")}
            style={{
                top: y + "%",
                left: x + "%",
                width: size + "px",
                height: size + "px",
                animationDelay: (index % 10) + "s",
            }}
            key={index}
        ></div>
    ));

    return <>{particles}</>;
}
