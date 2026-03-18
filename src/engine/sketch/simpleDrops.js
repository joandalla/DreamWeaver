export default function simpleDrops(p) {
  let particles = [];

  p.setup = () => {
    p.createCanvas(400, 300);
    p.background(240);
  };

  p.draw = () => {
    p.background(240, 20); // leichte Unschärfe für Nachzieheffekt

    // Neue Partikel zufällig erzeugen (simuliert Tropfen)
    if (p.frameCount % 10 === 0) {
      particles.push({
        x: p.random(20, 380),
        y: 10,
        vx: p.random(-1, 1),
        vy: 0,
        size: p.random(5, 15),
        color: p.random(['#8B4513', '#D2691E', '#4682B4', '#000000'])
      });
    }

    // Physik-Update
    for (let i = particles.length - 1; i >= 0; i--) {
      const pcl = particles[i];
      pcl.vy += 0.2; // Gravitation
      pcl.x += pcl.vx;
      pcl.y += pcl.vy;

      // Bodenkontakt
      if (pcl.y > p.height - pcl.size) {
        pcl.y = p.height - pcl.size;
        pcl.vy *= -0.3; // Abprallen mit Energieverlust
        pcl.vx *= 0.9;
      }

      // Zeichnen
      p.fill(pcl.color);
      p.noStroke();
      p.ellipse(pcl.x, pcl.y, pcl.size);

      // Entfernen, wenn zu lange am Boden oder außerhalb
      if (pcl.y > p.height + 50 || pcl.x < -50 || pcl.x > p.width + 50) {
        particles.splice(i, 1);
      }
    }
  };
}