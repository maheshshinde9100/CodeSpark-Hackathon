  const fxLayers = ['.fx-blobs','.fx-grid','.fx-scan','.fx-stars'].map(s=>document.querySelector(s));
  document.getElementById('reduceFxBtn').addEventListener('click', ()=>{
    const hidden = fxLayers[0].style.display === 'none';
    fxLayers.forEach(el => el.style.display = hidden ? '' : 'none');
  });

const skills = [
    { name: 'Java', level: 91, c1:'#ef4444', c2:'#f97316' },       // Red-Orange
    { name: 'JavaScript', level: 85, c1:'#f59e0b', c2:'#eab308' }, // Gold-Yellow
    { name: 'C++', level: 70, c1:'#a855f7', c2:'#d946ef' },        // Purple-Pink
    { name: 'React.js', level: 75, c1:'#0ea5e9', c2:'#3b82f6' },   // Blue-Purple
    { name: 'Tailwind CSS', level: 80, c1:'#06b6d4', c2:'#22d3ee' }, // Cyan
    { name: 'Spring Boot', level: 90, c1:'#16a34a', c2:'#22c55e' },  // Green
    { name: 'Node.js', level: 70, c1:'#10b981', c2:'#14b8a6' },      // Teal
    { name: 'Hibernate', level: 90, c1:'#84cc16', c2:'#a3e635' },    // Lime
    { name: 'MongoDB', level: 89, c1:'#22d3ee', c2:'#818cf8' },      // Cyan-Purple
    { name: 'MySQL', level: 85, c1:'#60a5fa', c2:'#38bdf8' },        // Light Blue
    { name: 'Redis', level: 60, c1:'#f43f5e', c2:'#fb7185' },        // Pink
    { name: 'Docker', level: 65, c1:'#2563eb', c2:'#1d4ed8' },       // Deep Blue
    { name: 'Git', level: 90, c1:'#f43f5e', c2:'#dc2626' },          // Red
    { name: 'Postman', level: 95, c1:'#f97316', c2:'#f59e0b' },      // Orange
    { name: 'SonarQube', level: 70, c1:'#8b5cf6', c2:'#a855f7' },    // Purple
    { name: 'Kafka', level: 40, c1:'#d946ef', c2:'#c026d3' },        // Pink-Purple
    
    // New additions with cyberpunk-friendly colors
    { name: 'Google Cloud', level: 72, c1:'#4285F4', c2:'#34A853' }, // Google blue-green
    { name: 'Maven', level: 75, c1:'#FF5722', c2:'#FF9800' },        // Orange gradient
    { name: 'Android Studio', level: 86, c1:'#3DDC84', c2:'#00C853' } // Android green
];

  // Render enhanced skill cards (ring + bar)
  (function renderSkills() {
    const grid = document.getElementById('skillsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    skills.forEach((s, idx) => {
      // Column wrapper
      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-lg-4';

      // Card
      const card = document.createElement('div');
      card.className = 'skill-card';
      card.style.setProperty('--c1', s.c1);
      card.style.setProperty('--c2', s.c2);

      // Ring gauge
      const ring = document.createElement('div');
      ring.className = 'skill-ring';
      ring.style.setProperty('--pct', String(s.level));
      ring.style.setProperty('--c1', s.c1);
      ring.style.setProperty('--c2', s.c2);
      ring.innerHTML = `<div class="ring-label">${s.level}%</div>`;

      // Body
      const body = document.createElement('div');
      body.className = 'skill-body';
      body.innerHTML = `
        <div class="skill-name">
          <span>${s.name}</span>
          <span class="skill-chip" style="border-color:${s.c1}33;background:rgba(255,255,255,.05)">${s.level}%</span>
        </div>
        <div class="skill-meta">
          <div class="skill-bar" aria-label="${s.name} proficiency" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.level}">
            <span style="--c1:${s.c1};--c2:${s.c2}"></span>
          </div>
        </div>
      `;

      card.appendChild(ring);
      card.appendChild(body);
      col.appendChild(card);
      grid.appendChild(col);

      // Staggered reveal + animate bar width
      const bar = body.querySelector('.skill-bar > span');
      card.style.opacity = '0';
      card.style.transform = 'translateY(6px)';
      requestAnimationFrame(() => {
        setTimeout(() => {
          card.style.transition = 'opacity .25s ease, transform .25s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
          bar.style.width = s.level + '%';
        }, 50 * idx);
      });
    });
  })();
