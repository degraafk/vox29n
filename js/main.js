(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Cuenta atrás hasta el 29 de noviembre de 2026 (hora de Madrid) ---------- */
  const objetivo = new Date('2026-11-29T00:00:00+01:00').getTime();
  const reloj = document.getElementById('reloj');
  const celdas = reloj ? {
    d: reloj.querySelector('[data-u="d"]'),
    h: reloj.querySelector('[data-u="h"]'),
    m: reloj.querySelector('[data-u="m"]'),
    s: reloj.querySelector('[data-u="s"]'),
  } : null;
  const dos = n => String(n).padStart(2, '0');

  function pintarReloj() {
    if (!celdas) return;
    const resto = Math.max(0, objetivo - Date.now());
    const s = Math.floor(resto / 1000);
    celdas.d.textContent = Math.floor(s / 86400);
    celdas.h.textContent = dos(Math.floor((s % 86400) / 3600));
    celdas.m.textContent = dos(Math.floor((s % 3600) / 60));
    celdas.s.textContent = dos(s % 60);
    if (resto === 0) clearInterval(temporizador);
  }
  let temporizador = setInterval(pintarReloj, 1000);
  pintarReloj();

  /* ---------- Barra fija: aparece el logo al dejar atrás la portada ---------- */
  const barra = document.querySelector('.barra');
  const portada = document.querySelector('.portada');
  if (barra && portada && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      barra.classList.toggle('es-fija', !e.isIntersecting);
    }, { threshold: 0, rootMargin: '-1px 0px 0px 0px' }).observe(portada);
  }

  /* ---------- Enlace activo en la barra ---------- */
  const enlaces = [...document.querySelectorAll('.barra__lista a')];
  if ('IntersectionObserver' in window) {
    const porId = new Map(enlaces.map(a => [a.getAttribute('href').slice(1), a]));
    const marcar = id => enlaces.forEach(a => a.setAttribute('aria-current', String(porId.get(id) === a)));
    const io = new IntersectionObserver(entradas => {
      entradas.forEach(e => { if (e.isIntersecting) marcar(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    porId.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    // Fuera de las cinco secciones no se marca ninguna
    const limpiar = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) enlaces.forEach(a => a.setAttribute('aria-current', 'false'));
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['inicio', 'participa'].forEach(id => { const el = document.getElementById(id); if (el) limpiar.observe(el); });
  }

  /* ---------- Provincias ---------- */
  const provincias = ['Álava','Albacete','Alicante','Almería','Asturias','Ávila','Badajoz','Baleares','Barcelona','Burgos','Cáceres','Cádiz','Cantabria','Castellón','Ceuta','Ciudad Real','Córdoba','A Coruña','Cuenca','Girona','Granada','Guadalajara','Gipuzkoa','Huelva','Huesca','Jaén','León','Lleida','Lugo','Madrid','Málaga','Melilla','Murcia','Navarra','Ourense','Palencia','Las Palmas','Pontevedra','La Rioja','Salamanca','Santa Cruz de Tenerife','Segovia','Sevilla','Soria','Tarragona','Teruel','Toledo','Valencia','Valladolid','Bizkaia','Zamora','Zaragoza'];
  const select = document.getElementById('provincia');
  if (select) provincias.forEach(p => select.add(new Option(p, p)));

  /* ---------- Formulario (demo: no envía datos a ningún sitio) ---------- */
  const form = document.getElementById('form-participa');
  const estado = document.getElementById('form-estado');
  if (form) {
    form.addEventListener('submit', ev => {
      ev.preventDefault();
      let ok = true;
      form.querySelectorAll('[required]').forEach(c => {
        const valido = c.type === 'checkbox' ? c.checked : c.value.trim() !== '' && c.checkValidity();
        c.setAttribute('aria-invalid', String(!valido));
        if (!valido) ok = false;
      });
      estado.hidden = false;
      estado.classList.toggle('es-error', !ok);
      if (!ok) { estado.textContent = 'Revisa los campos marcados y acepta la política de privacidad.'; return; }
      // TODO: aquí va la llamada a tu backend o a un servicio de formularios.
      estado.textContent = 'Gracias. Hemos recibido tu solicitud.';
      form.reset();
    });
  }

  /* ---------- Animaciones (GSAP) ---------- */
  function iniciarGsap() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // 1. Entrada de la portada: la imagen emerge de la oscuridad y se asienta
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.fromTo('.portada__velo', { opacity: 1 }, { opacity: 0, duration: 1.3 }, 0)
      .fromTo('.portada__img', { scale: 1.08 }, { scale: 1, duration: 2.2 }, 0)
      .from('.portada__logo', { y: -12, opacity: 0, duration: .8 }, .7);

    // 2. Parallax suave de la foto al bajar
    if (window.matchMedia('(min-width: 701px)').matches) {
      gsap.to('.portada__img', {
        yPercent: 6.5, ease: 'none',
        scrollTrigger: { trigger: '.portada', start: 'top top', end: 'bottom top', scrub: true },
      });
    }

    // 3. Manifiesto: las palabras se encienden al hacer scroll
    const texto = document.querySelector('[data-scrub]');
    if (texto) {
      const palabras = texto.textContent.trim().split(/\s+/);
      texto.setAttribute('aria-label', texto.textContent.trim());
      texto.innerHTML = palabras.map(p => `<span class="palabra" aria-hidden="true">${p} </span>`).join('');
      const spans = texto.querySelectorAll('.palabra');
      gsap.set(spans, { opacity: 0.16 });
      gsap.to(spans, {
        opacity: 1, ease: 'none', stagger: 0.12,
        scrollTrigger: { trigger: texto, start: 'top 82%', end: 'bottom 50%', scrub: true },
      });
    }
  }

  window.addEventListener('load', iniciarGsap);
})();
