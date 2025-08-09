    const fxLayers = ['.fx-blobs','.fx-grid','.fx-scan','.fx-stars'].map(s=>document.querySelector(s));
    document.getElementById('reduceFxBtn').addEventListener('click', ()=>{
      const hidden = fxLayers[0].style.display === 'none';
      fxLayers.forEach(el => el.style.display = hidden ? '' : 'none');
    });

    // Skills data
    const skills = [
      { name: 'Java', level: 91, c1:'#ef4444', c2:'#f59e0b' },
      { name: 'Spring Boot', level: 90, c1:'#16a34a', c2:'#22c55e' },
      { name: 'React.js', level: 80, c1:'#06b6d4', c2:'#7c3aed' },
      { name: 'Node.js', level: 70, c1:'#22c55e', c2:'#10b981' },
      { name: 'MongoDB', level: 80, c1:'#22c55e', c2:'#84cc16' },
      { name: 'MySQL', level: 85, c1:'#0ea5e9', c2:'#22d3ee' },
      { name: 'Hibernate', level: 90, c1:'#22c55e', c2:'#0ea5e9' },
      { name: 'Kafka', level: 40, c1:'#fb7185', c2:'#f43f5e' },
    ];

    // Render skills orbs with animated conic progress
    const grid = document.getElementById('skillsGrid');
    skills.forEach((s, idx)=>{
      const el = document.createElement('div');
      el.className = 'orb';
      el.style.setProperty('--c1', s.c1);
      el.style.setProperty('--c2', s.c2);
      el.innerHTML = `
        <div class="ring"></div>
        <div class="inner">
          <div class="pct">${s.level}%</div>
          <div class="label">${s.name}</div>
        </div>
      `;
      // dynamic ring with conic gradient representing level
      const ring = el.querySelector('.ring');
      ring.style.background = `conic-gradient(${s.c1} ${s.level*3.6}deg, rgba(255,255,255,0.06) 0deg)`;

      // subtle staggered reveal
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      grid.appendChild(el);
      requestAnimationFrame(()=>{
        setTimeout(()=>{
          el.style.transition = 'opacity .25s ease, transform .25s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 60*idx);
      });
    });
