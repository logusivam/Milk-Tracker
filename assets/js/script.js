
gsap.registerPlugin(ScrollTrigger);

// Responsive Spotlight
window.addEventListener('mousemove', e => {
    gsap.to('#spotlight', { '--x': `${e.clientX}px`, '--y': `${e.clientY}px`, duration: 0.1 });
});

// Magnetic effect only for non-touch devices
if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
            gsap.to(btn, { x, y, duration: 0.3 });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        });
    });
}

const milkContainer = document.getElementById('milk-container');
const level = document.getElementById('level');
const stream = document.getElementById('stream');
const metricSidebar = document.getElementById('metric-sidebar');
const volumeVal = document.getElementById('volume-val');
const costVal = document.getElementById('cost-val');
let isFilling = false;

const PRICE_PER_ML = 0.04;

function createSplashParticle() {
    const particle = document.createElement('div');
    particle.className = 'milk-particle';
    const size = Math.random() * 4 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';

    const rect = milkContainer.getBoundingClientRect();
    particle.style.left = (rect.width / 2) + 'px';
    particle.style.bottom = '5px';

    milkContainer.appendChild(particle);

    const angle = (Math.random() - 0.5) * 2;
    const distance = Math.random() * 30 + 10;

    gsap.to(particle, {
        x: Math.sin(angle) * distance,
        y: -Math.random() * 40 - 10,
        opacity: 0,
        scale: 0.5,
        duration: 0.5,
        ease: "power1.out",
        onComplete: () => particle.remove()
    });
}

milkContainer.addEventListener('click', () => {
    if (isFilling) return;
    isFilling = true;

    metricSidebar.classList.add('active');
    milkContainer.classList.add('is-active');

    gsap.to(stream, {
        top: "0px",
        opacity: 1,
        height: "100%",
        duration: 0.6,
        ease: "power2.in"
    });

    setTimeout(() => {
        level.style.height = "85%";

        let count = { val: 0 };
        gsap.to(count, {
            val: 250,
            duration: 2.5,
            onUpdate: () => {
                const currentVol = Math.floor(count.val);
                volumeVal.innerText = currentVol;
                costVal.innerText = (currentVol * PRICE_PER_ML).toFixed(2);
            }
        });

        const splashInterval = setInterval(() => {
            if (!isFilling) {
                clearInterval(splashInterval);
                return;
            }
            createSplashParticle();
        }, 80);

        setTimeout(() => clearInterval(splashInterval), 2500);

    }, 400);

    setTimeout(() => {
        gsap.to(stream, { opacity: 0, top: "-200px", duration: 0.5 });

        setTimeout(() => {
            level.style.height = "0%";
            metricSidebar.classList.remove('active');
            milkContainer.classList.remove('is-active');
            isFilling = false;
        }, 3500);
    }, 2500);
});

function startAnimations() {
    gsap.to(".reveal", {
        opacity: 1, y: 0, scale: 1,
        duration: 1, stagger: 0.1, ease: "power3.out"
    });
}

window.addEventListener('load', startAnimations);
