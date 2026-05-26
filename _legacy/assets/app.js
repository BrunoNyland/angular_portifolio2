// App: loader, Lenis smooth scroll, GSAP scroll animations, i18n, interactions.

(function () {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // ---------------- i18n render ----------------
  const C = window.CONTENT;
  let lang = (localStorage.getItem('lang') || 'pt');

  function txt(node, value) { node.textContent = value; }
  function frag(parts) {
    // parts: array of strings or { em: "..." } / { outline: "..." }
    const out = document.createDocumentFragment();
    parts.forEach(p => {
      if (typeof p === 'string') out.appendChild(document.createTextNode(p));
      else if (p.em) {
        const e = document.createElement('em'); e.textContent = p.em; out.appendChild(e);
      } else if (p.outline) {
        const e = document.createElement('span'); e.className = 'outline'; e.textContent = p.outline;
        out.appendChild(document.createTextNode(' '));
        out.appendChild(e);
      }
    });
    return out;
  }

  function render() {
    const d = C[lang];

    // Nav
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.textContent = d.nav[el.dataset.nav];
    });

    // Lang toggle
    document.querySelectorAll('.lang button').forEach(b => {
      b.classList.toggle('is-on', b.dataset.lang === lang);
    });

    // HERO
    const h = d.hero;
    document.getElementById('hero-eyebrow').textContent = h.eyebrow;
    document.getElementById('hero-l1').textContent = h.l1;
    document.getElementById('hero-l2').textContent = h.l2;
    document.getElementById('hero-l3').textContent = h.l3;
    document.getElementById('hero-l4').textContent = h.l4;
    document.getElementById('hero-meta-title').textContent = h.metaTitle;
    document.getElementById('hero-meta-sub').textContent = h.metaSub;
    document.getElementById('hero-foot1l').textContent = h.foot1l;
    document.getElementById('hero-foot1v').textContent = h.foot1v;
    document.getElementById('hero-foot2l').textContent = h.foot2l;
    document.getElementById('hero-foot2v').textContent = h.foot2v;
    document.getElementById('hero-foot3l').textContent = h.foot3l;
    document.getElementById('hero-foot3v').textContent = h.foot3v;
    document.getElementById('hero-foot4').textContent = h.foot4;

    // ABOUT
    const a = d.about;
    document.querySelector('#sec-about .num').textContent = a.num;
    document.querySelector('#sec-about .ttl').textContent = a.title;
    const lead = document.getElementById('about-lead');
    lead.innerHTML = '';
    lead.appendChild(frag(a.lead));
    document.getElementById('about-p1').textContent = a.p1;
    document.getElementById('about-p2').textContent = a.p2;
    const sgrid = document.getElementById('about-stats');
    sgrid.innerHTML = '';
    a.stats.forEach(s => {
      const div = document.createElement('div');
      div.innerHTML = `<div class="n">${s.n}<sup>${s.sup}</sup></div><div class="l">${s.l}</div>`;
      sgrid.appendChild(div);
    });

    // SKILLS
    const sk = d.skills;
    document.querySelector('#sec-skills .num').textContent = sk.num;
    document.querySelector('#sec-skills .ttl').textContent = sk.title;
    const skg = document.getElementById('skills-grid');
    skg.innerHTML = '';
    sk.groups.forEach((g, i) => {
      const el = document.createElement('div');
      el.className = 'skill';
      el.innerHTML = `
        <div class="skill__idx">0${i+1}</div>
        <div class="skill__cat">${g.cat}</div>
        <div class="skill__list">${g.items.map(x => `<span>${x}</span>`).join('')}</div>
      `;
      skg.appendChild(el);
    });

    // WORK
    const w = d.work;
    document.querySelector('#sec-work .num').textContent = w.num;
    document.querySelector('#sec-work .ttl').textContent = w.title;
    const wg = document.getElementById('work-grid');
    wg.innerHTML = '';
    w.items.forEach((p, i) => {
      const el = document.createElement('div');
      el.className = 'project';
      el.innerHTML = `
        <div class="project__head">
          <span>${String(i+1).padStart(2,'0')} · ${p.k}</span>
          <span class="yr">${p.y}</span>
        </div>
        <div class="project__visual">
          <span class="blob"></span>
          <span class="ph">${p.ph}</span>
        </div>
        <div>
          <div class="project__title"><span>${p.t}</span><span class="arr">↗</span></div>
          <div class="project__tags">${p.tags.map(t=>`<span>${t}</span>`).join('')}</div>
        </div>
      `;
      // tilt cursor effect
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX-r.left)/r.width*100)+'%');
        el.style.setProperty('--my', ((e.clientY-r.top)/r.height*100)+'%');
      });
      wg.appendChild(el);
    });

    // XP
    const xp = d.xp;
    document.querySelector('#sec-xp .num').textContent = xp.num;
    document.querySelector('#sec-xp .ttl').textContent = xp.title;
    const tl = document.getElementById('xp-list');
    tl.innerHTML = '';
    xp.items.forEach((it, i) => {
      const el = document.createElement('div');
      el.className = 'tl-item';
      el.innerHTML = `
        <div class="tl-item__when">${it.from} — ${it.to}<b>${String(i+1).padStart(2,'0')} / ${xp.items.length}</b></div>
        <div class="tl-item__role">${it.role}<b>${it.co}</b></div>
        <div class="tl-item__desc">${it.desc}</div>
      `;
      tl.appendChild(el);
    });

    // BLOG
    const bl = d.blog;
    document.querySelector('#sec-blog .num').textContent = bl.num;
    document.querySelector('#sec-blog .ttl').textContent = bl.title;
    const blg = document.getElementById('blog-grid');
    blg.innerHTML = '';
    bl.items.forEach(p => {
      const el = document.createElement('div');
      el.className = 'post';
      el.innerHTML = `
        <div class="post__meta"><span class="tag">${p.tag}</span><span>${p.date}</span></div>
        <div class="post__title">${p.t}</div>
        <div class="post__excerpt">${p.x}</div>
        <div class="post__cta"><span>${bl.cta}</span><span class="arr">→</span></div>
      `;
      blg.appendChild(el);
    });

    // CONTACT
    const ct = d.contact;
    document.querySelector('#sec-contact .num').textContent = ct.num;
    document.querySelector('#sec-contact .ttl').textContent = ct.title;
    const big = document.getElementById('contact-big');
    big.innerHTML = '';
    big.appendChild(frag(ct.big));
    const cg = document.getElementById('contact-grid');
    cg.innerHTML = '';
    ct.items.forEach(it => {
      const a = document.createElement('a');
      a.href = it.href; a.target = '_blank'; a.rel = 'noopener';
      a.innerHTML = `<div class="l">${it.l}</div><div class="v">${it.v}</div>`;
      cg.appendChild(a);
    });

    // FOOT
    document.getElementById('foot-l').textContent = d.foot.l;
    document.getElementById('foot-r').textContent = d.foot.r;

    // Loader text
    document.getElementById('loader-top1').textContent = d.loader.top1;
    document.getElementById('loader-top2').textContent = d.loader.top2;
    document.getElementById('loader-foot1').textContent = d.loader.foot1;
    document.getElementById('loader-foot2').textContent = d.loader.foot2;

    document.documentElement.lang = lang;
  }

  // ---------------- Loader ----------------
  function runLoader() {
    return new Promise(resolve => {
      const numEl = document.getElementById('loader-num');
      const barEl = document.getElementById('loader-bar');
      let p = 0;
      const tick = () => {
        const inc = Math.max(0.4, (100 - p) * 0.04);
        p += inc;
        if (p >= 100) {
          p = 100;
          numEl.firstChild.nodeValue = '100';
          barEl.style.right = '0%';
          setTimeout(resolve, 350);
          return;
        }
        numEl.firstChild.nodeValue = String(Math.floor(p)).padStart(3, '0');
        barEl.style.right = (100 - p) + '%';
        setTimeout(tick, 30 + Math.random() * 30);
      };
      tick();
    });
  }

  // ---------------- Boot ----------------
  document.addEventListener('DOMContentLoaded', async () => {
    render();

    // Loader run
    await runLoader();

    // Exit loader
    const loader = document.querySelector('.loader');
    await new Promise(res => {
      gsap.to(loader, {
        yPercent: -100,
        duration: 1.1,
        ease: "expo.inOut",
        onComplete: () => {
          loader.style.display = 'none';
          document.body.classList.remove('is-loading');
          document.body.classList.add('is-loaded');
          res();
        }
      });
    });

    initLenis();
    initIntro();
    initScroll();
    initInteractions();
  });

  // ---------------- Lenis smooth scroll ----------------
  let lenis;
  function initLenis() {
    lenis = new window.Lenis({
      duration: (window.__tweaks && window.__tweaks.scrollSpeed) || 1.1,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
    window.__lenis = lenis;
    lenis.on('scroll', (e) => {
      if (window.__scene) window.__scene.setScroll(e.scroll);
      ScrollTrigger.update();
      // progress bar
      const pct = e.scroll / (document.documentElement.scrollHeight - window.innerHeight);
      document.getElementById('progress').style.width = (pct * 100) + '%';
      // back to top visibility
      document.getElementById('totop').classList.toggle('is-on', e.scroll > window.innerHeight * 0.6);
    });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ---------------- Intro animation ----------------
  function initIntro() {
    const lines = document.querySelectorAll('.hero__title .line > i');
    gsap.set(lines, { yPercent: 110 });
    const tl = gsap.timeline();
    tl.to(lines, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.08 })
      .from('.hero__meta-top', { autoAlpha: 0, y: 10, duration: 0.6 }, "-=0.6")
      .from('.hero__foot > *', { autoAlpha: 0, y: 18, duration: 0.6, stagger: 0.06 }, "-=0.6")
      .from('.nav', { autoAlpha: 0, y: -10, duration: 0.5 }, "-=0.8");
  }

  // ---------------- Scroll triggers ----------------
  function initScroll() {
    // Section headings reveal
    document.querySelectorAll('.section').forEach(sec => {
      const head = sec.querySelector('.section__head');
      if (head) {
        gsap.from(head.children, {
          scrollTrigger: { trigger: sec, start: "top 80%" },
          autoAlpha: 0, y: 20, duration: 0.7, stagger: 0.1, ease: "power2.out"
        });
      }
    });

    // ABOUT lead text — slide up by line
    gsap.from('#about-lead', {
      scrollTrigger: { trigger: '#sec-about', start: "top 70%" },
      autoAlpha: 0, y: 40, duration: 1, ease: "power3.out"
    });
    gsap.from('#sec-about .about__col > *', {
      scrollTrigger: { trigger: '#sec-about', start: "top 65%" },
      autoAlpha: 0, y: 30, duration: 0.7, stagger: 0.1, ease: "power2.out"
    });

    // Skills cards stagger
    gsap.from('#skills-grid .skill', {
      scrollTrigger: { trigger: '#sec-skills', start: "top 75%" },
      autoAlpha: 0, y: 40, duration: 0.7, stagger: 0.08, ease: "power2.out"
    });

    // Projects cards stagger
    gsap.from('#work-grid .project', {
      scrollTrigger: { trigger: '#sec-work', start: "top 80%" },
      autoAlpha: 0, y: 50, duration: 0.8, stagger: 0.1, ease: "power2.out"
    });

    // Timeline rows
    gsap.utils.toArray('#xp-list .tl-item').forEach(item => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: "top 85%" },
        autoAlpha: 0, x: -30, duration: 0.8, ease: "power2.out"
      });
    });

    // Blog cards
    gsap.from('#blog-grid .post', {
      scrollTrigger: { trigger: '#sec-blog', start: "top 80%" },
      autoAlpha: 0, y: 40, duration: 0.8, stagger: 0.1, ease: "power2.out"
    });

    // Contact big text scrub
    gsap.from('#contact-big', {
      scrollTrigger: { trigger: '#sec-contact', start: "top 75%" },
      autoAlpha: 0, y: 60, duration: 1, ease: "power3.out"
    });
    gsap.from('#contact-grid > *', {
      scrollTrigger: { trigger: '#sec-contact', start: "top 70%" },
      autoAlpha: 0, y: 20, duration: 0.6, stagger: 0.08, ease: "power2.out"
    });

    // Fade + blur transition between sections (original effect — bidirectional scrub on both sides)
    document.querySelectorAll('section.section').forEach(sec => {
      const blurMax = (window.__tweaks && window.__tweaks.sectionBlur) || 8;
      gsap.fromTo(sec,
        { filter: `blur(${blurMax}px)`, opacity: 0.0 },
        {
          filter: "blur(0px)", opacity: 1,
          scrollTrigger: { trigger: sec, start: "top 92%", end: "top 60%", scrub: 0.6 }
        }
      );
      gsap.to(sec, {
        filter: `blur(${Math.max(0, blurMax - 2)}px)`, opacity: 0.5,
        scrollTrigger: { trigger: sec, start: "bottom 40%", end: "bottom 5%", scrub: 0.6 }
      });
    });

    // Scene hue shifts at each section
    const hueMap = [
      { id: '#sec-hero', h: 0.72 },
      { id: '#sec-about', h: 0.78 },
      { id: '#sec-skills', h: 0.55 },
      { id: '#sec-work', h: 0.85 },
      { id: '#sec-xp', h: 0.68 },
      { id: '#sec-blog', h: 0.92 },
      { id: '#sec-contact', h: 0.72 }
    ];
    hueMap.forEach(m => {
      const el = document.querySelector(m.id);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el, start: "top 60%", end: "bottom 40%",
        onEnter: () => { if (window.__scene && !(window.__tweaks && window.__tweaks.lockAccent)) window.__scene.setHue(m.h); },
        onEnterBack: () => { if (window.__scene && !(window.__tweaks && window.__tweaks.lockAccent)) window.__scene.setHue(m.h); }
      });
    });

    // Active nav link by section
    document.querySelectorAll('section.section').forEach(sec => {
      const id = sec.id;
      ScrollTrigger.create({
        trigger: sec, start: "top 40%", end: "bottom 40%",
        onToggle: (self) => {
          if (self.isActive) {
            document.querySelectorAll('.nav__menu a').forEach(a => {
              a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
            });
          }
        }
      });
    });
  }

  // ---------------- Interactions ----------------
  function initInteractions() {
    // Nav clicks — Lenis scroll + scene pulse
    document.querySelectorAll('[data-scrollto]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const id = a.getAttribute('href');
        const target = document.querySelector(id);
        if (!target) return;
        if (window.__scene) window.__scene.pulse();
        lenis.scrollTo(target, { offset: 0, duration: 1.4 });
      });
    });

    // Back to top
    document.getElementById('totop').addEventListener('click', () => {
      if (window.__scene) window.__scene.pulse();
      lenis.scrollTo(0, { duration: 1.6 });
    });

    // Language toggle
    document.querySelectorAll('.lang button').forEach(b => {
      b.addEventListener('click', () => {
        lang = b.dataset.lang;
        localStorage.setItem('lang', lang);
        render();
        // Re-run intro lines so newly-rendered text animates in
        const lines = document.querySelectorAll('.hero__title .line > i');
        gsap.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.05 });
        if (window.__scene) window.__scene.pulse();
        ScrollTrigger.refresh();
      });
    });

    // Custom cursor
    const cursor = document.getElementById('cursor');
    window.addEventListener('mousemove', (e) => {
      cursor.classList.add('is-on');
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.18, ease: "power2.out", overwrite: true });
    });
    document.querySelectorAll('a, button, .project, .post').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  // ---------------- Tweaks bridge ----------------
  window.__applyTweaks = function (t) {
    window.__tweaks = t;

    // Accent → CSS var + Three.js
    if (t.accent) {
      document.documentElement.style.setProperty('--accent', t.accent);
      if (window.__scene) window.__scene.setAccentColor(t.accent);
    }
    // 3D B visibility
    if (window.__scene) window.__scene.setBVisible(t.showB !== false);
    // Particles
    if (window.__scene) window.__scene.setParticleDensity(t.particles ?? 900);
    // Smooth scroll speed
    if (lenis && t.scrollSpeed) {
      lenis.options.duration = t.scrollSpeed;
    }
    // Custom cursor
    const c = document.getElementById('cursor');
    if (c) c.style.display = t.cursor === false ? 'none' : '';
    // sectionBlur is read live by GSAP via window.__tweaks.sectionBlur
    // Force scrollTrigger to re-evaluate the dynamic blur functions
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  };
})();
