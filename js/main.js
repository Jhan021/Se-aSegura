document.addEventListener('DOMContentLoaded', () => {
  /* ========================================================================
     1. MENÚ MÓVIL RESPONSIVE Y TECLA ESCAPE (Secciones 5.2 y 5.4)
     ======================================================================== */
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  function closeMobileMenu() {
    navMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    navMenu.classList.toggle('open');
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      closeMobileMenu();
      menuToggle.focus();
    }
  });

  /* ========================================================================
     2. CONTROLES DE ACCESIBILIDAD WCAG 2.2 AAA + LOCALSTORAGE (Sección 5.4 & 6.2.2)
     ======================================================================== */
  const btnHighContrast = document.getElementById('btnHighContrast');
  const btnIncreaseFont = document.getElementById('btnIncreaseFont');
  const btnResetFont = document.getElementById('btnResetFont');
  const btnDecreaseFont = document.getElementById('btnDecreaseFont');

  let fontScale = parseFloat(localStorage.getItem('senasegura_font_scale')) || 1;
  const savedContrast = localStorage.getItem('senasegura_high_contrast') === 'true';

  function applyFontScale(scale) {
    fontScale = Math.min(1.24, Math.max(0.92, +scale.toFixed(2)));
    document.documentElement.style.setProperty('--font-scale', fontScale);
    localStorage.setItem('senasegura_font_scale', String(fontScale));
  }

  function applyHighContrast(active) {
    document.body.classList.toggle('high-contrast', active);
    btnHighContrast.classList.toggle('active', active);
    btnHighContrast.setAttribute('aria-pressed', String(active));
    localStorage.setItem('senasegura_high_contrast', String(active));
  }

  // Restaurar preferencias guardadas
  applyFontScale(fontScale);
  applyHighContrast(savedContrast);

  btnHighContrast.addEventListener('click', () => {
    const nextState = !document.body.classList.contains('high-contrast');
    applyHighContrast(nextState);
  });

  btnIncreaseFont.addEventListener('click', () => applyFontScale(fontScale + 0.08));
  btnResetFont.addEventListener('click', () => applyFontScale(1));
  btnDecreaseFont.addEventListener('click', () => applyFontScale(fontScale - 0.08));

  /* ========================================================================
     3. COMPARADOR DE TIEMPOS DE EVACUACIÓN Y BARRIDO (Capítulos II y III)
     ======================================================================== */
  const buildingType = document.getElementById('buildingType');
  const floorCount = document.getElementById('floorCount');
  const occupantCount = document.getElementById('occupantCount');
  const floorCountVal = document.getElementById('floorCountVal');
  const occupantCountVal = document.getElementById('occupantCountVal');
  const barSweepAsIs = document.getElementById('barSweepAsIs');
  const barSweepToBe = document.getElementById('barSweepToBe');
  const compSweepSaving = document.getElementById('compSweepSaving');
  const compSummaryText = document.getElementById('compSummaryText');

  function updateEvacuationComparator() {
    const floors = parseInt(floorCount.value, 10);
    const occupants = parseInt(occupantCount.value, 10);
    const typeFactor = buildingType.value === 'galeria' ? 1.15 : (buildingType.value === 'universidad' ? 1.05 : 1.0);

    floorCountVal.textContent = `${floors} pisos`;
    occupantCountVal.textContent = `${occupants} ${occupants === 1 ? 'persona' : 'personas'}`;

    // Modelo basado en métricas del informe (Cap. II 2.3.7: 15-20 min barrido manual As-Is, ahorro del 60% con SeñaSegura)
    const asIsSweepMin = +((floors * 3.2 + occupants * 0.33) * typeFactor).toFixed(1);
    const toBeSweepMin = +(asIsSweepMin * 0.40).toFixed(1); // 60% de ahorro en tiempo de barrido
    const savedMin = +(asIsSweepMin - toBeSweepMin).toFixed(1);

    barSweepAsIs.textContent = `Sin SeñaSegura: ${asIsSweepMin.toFixed(1)} min`;
    barSweepToBe.textContent = `Con SeñaSegura: ${toBeSweepMin.toFixed(1)} min`;
    barSweepToBe.style.width = '40%';
    compSweepSaving.textContent = `Ahorro de ${savedMin.toFixed(1)} min críticos`;

    compSummaryText.innerHTML = `En una edificación de <strong>${floors} pisos</strong> con <strong>${occupants} ${occupants === 1 ? 'ocupante vulnerable' : 'ocupantes vulnerables'}</strong>, la confirmación 1-Tap reduce el barrido manual a ciegas de <strong>${asIsSweepMin.toFixed(1)} min</strong> a <strong>${toBeSweepMin.toFixed(1)} min</strong> y elimina el retraso de 45–60 segundos en el segundo cero.`;
  }

  buildingType.addEventListener('change', updateEvacuationComparator);
  floorCount.addEventListener('input', updateEvacuationComparator);
  occupantCount.addEventListener('input', updateEvacuationComparator);
  updateEvacuationComparator();

  /* ========================================================================
     4. PESTAÑAS INTERACTIVAS DEL ECOSISTEMA + TECLADO ARROWLEFT/ARROWRIGHT
     ======================================================================== */
  const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
  const tabPanels = document.querySelectorAll('.tab-panel');

  function activateTab(btn) {
    tabButtons.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
      b.setAttribute('tabindex', '-1');
    });
    tabPanels.forEach(p => {
      p.classList.remove('active');
      p.hidden = true;
    });

    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    btn.setAttribute('tabindex', '0');
    btn.focus();
    const targetPanel = document.getElementById(btn.getAttribute('aria-controls'));
    targetPanel.classList.add('active');
    targetPanel.hidden = false;
  }

  tabButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => activateTab(btn));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const nextIdx = (idx + dir + tabButtons.length) % tabButtons.length;
        activateTab(tabButtons[nextIdx]);
      }
    });
  });

  /* ========================================================================
     5. SIMULADOR INTERACTIVO + PLANO VECTORIAL SVG PISO 3 (PA-01 a PA-07)
     ======================================================================== */
  const btnSimSismo = document.getElementById('btnSimSismo');
  const btnSimIncendio = document.getElementById('btnSimIncendio');
  const btnSimReset = document.getElementById('btnSimReset');

  const simDevice = document.getElementById('simDevice');
  const deviceIcon = document.getElementById('deviceIcon');
  const deviceAlertTitle = document.getElementById('deviceAlertTitle');
  const deviceAlertMsg = document.getElementById('deviceAlertMsg');
  const deviceLspCard = document.getElementById('deviceLspCard');
  const lspInstruction = document.getElementById('lspInstruction');

  const btnUserSafe = document.getElementById('btnUserSafe');
  const btnUserSos = document.getElementById('btnUserSos');

  const simLogText = document.getElementById('simLogText');
  const dashUserStatus = document.getElementById('dashUserStatus');
  const dashActionHint = document.getElementById('dashActionHint');
  const dashFamilyStatus = document.getElementById('dashFamilyStatus');

  // Elementos del Plano Vectorial SVG del Piso 3
  const svgEastZone = document.getElementById('svgEastZone');
  const svgSmokeLabel = document.getElementById('svgSmokeLabel');
  const svgStairA = document.getElementById('svgStairA');
  const svgStairALabel = document.getElementById('svgStairALabel');
  const svgSafeRoute = document.getElementById('svgSafeRoute');
  const svgUserNode = document.getElementById('svgUserNode');

  let lastClickTime = 0; // Filtro anti-rebote (debounce 1500ms - HU-15)

  function updateSvgFloorPlan(mode) {
    if (mode === 'incendio') {
      svgEastZone.setAttribute('fill', '#4A1414');
      svgEastZone.setAttribute('stroke', '#D32F2F');
      svgSmokeLabel.textContent = 'FOCO HUMO (BLOQ.)';
      svgSmokeLabel.setAttribute('fill', '#FF8A80');

      svgStairA.setAttribute('fill', '#3B1818');
      svgStairA.setAttribute('stroke', '#D32F2F');
      svgStairALabel.textContent = 'ESCALERA A (BLOQ.)';
      svgStairALabel.setAttribute('fill', '#FF8A80');

      svgSafeRoute.setAttribute('stroke', '#00E676');
      svgSafeRoute.setAttribute('opacity', '1');
      svgUserNode.setAttribute('fill', '#FBC02D');
    } else if (mode === 'sismo') {
      svgEastZone.setAttribute('fill', '#3A3010');
      svgEastZone.setAttribute('stroke', '#FBC02D');
      svgSmokeLabel.textContent = 'ALERTA SÍSMICA';
      svgSmokeLabel.setAttribute('fill', '#FBC02D');

      svgStairA.setAttribute('fill', '#262626');
      svgStairA.setAttribute('stroke', '#FBC02D');
      svgStairALabel.textContent = 'ESCALERA A (PRECAUCIÓN)';
      svgStairALabel.setAttribute('fill', '#FBC02D');

      svgSafeRoute.setAttribute('stroke', '#00E676');
      svgSafeRoute.setAttribute('opacity', '1');
      svgUserNode.setAttribute('fill', '#FBC02D');
    } else if (mode === 'safe') {
      svgSafeRoute.setAttribute('stroke', '#2E7D32');
      svgSafeRoute.setAttribute('opacity', '0.7');
      svgUserNode.setAttribute('fill', '#2E7D32');
    } else {
      svgEastZone.setAttribute('fill', '#212121');
      svgEastZone.setAttribute('stroke', '#555555');
      svgSmokeLabel.textContent = 'Sensor Normal';
      svgSmokeLabel.setAttribute('fill', '#B0BEC5');

      svgStairA.setAttribute('fill', '#262626');
      svgStairA.setAttribute('stroke', '#555555');
      svgStairALabel.textContent = 'ESCALERA A (ESTÁNDAR)';
      svgStairALabel.setAttribute('fill', '#B0BEC5');

      svgSafeRoute.setAttribute('stroke', '#2E7D32');
      svgSafeRoute.setAttribute('opacity', '0.35');
      svgUserNode.setAttribute('fill', '#1976D2');
    }
  }

  function triggerEmergency(type) {
    if ('vibrate' in navigator) {
      navigator.vibrate([1000, 200, 1000, 200, 1000]);
    }

    simDevice.classList.add('alert-flashing');
    deviceLspCard.hidden = false;
    btnUserSafe.disabled = false;
    btnUserSos.disabled = false;
    updateSvgFloorPlan(type);

    if (type === 'sismo') {
      deviceIcon.textContent = '🌋';
      deviceAlertTitle.textContent = '¡SISMO DETECTADO!';
      deviceAlertTitle.style.color = '#FBC02D';
      deviceAlertMsg.textContent = 'Patrón háptico continuo activo. Dirígete a Salida B (Rampa).';
      lspInstruction.textContent = 'LSP: EVACUAR POR SALIDA B';
      simLogText.textContent = 'Alerta sísmica disparada en <500ms. Destello 1 Hz, LSP y ruta verde activos.';
    } else {
      deviceIcon.textContent = '🔥';
      deviceAlertTitle.textContent = '¡INCENDIO EN PISO 3!';
      deviceAlertTitle.style.color = '#EF5350';
      deviceAlertMsg.textContent = 'Humo en Ala Este. Evacúa por Salida B (Rampa Accesible).';
      lspInstruction.textContent = 'LSP: SALIDA B (RAMPA ACCESIBLE)';
      simLogText.textContent = 'Foco de humo marcado en Ala Este. Ruta recalculada a Salida B.';
    }

    dashUserStatus.textContent = '⚠️ EVACUANDO - Pendiente de confirmación';
    dashUserStatus.className = 'status-alert';
    dashActionHint.textContent = 'Brigadista alertado: Ocupante sorda en Oficina 304 guiada a Salida B.';
    dashFamilyStatus.textContent = 'En espera de reporte de estado del usuario...';
  }

  btnSimSismo.addEventListener('click', () => triggerEmergency('sismo'));
  btnSimIncendio.addEventListener('click', () => triggerEmergency('incendio'));

  btnUserSafe.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastClickTime < 1500) return; // Anti-rebote 1500ms (HU-15)
    lastClickTime = now;

    if ('vibrate' in navigator) navigator.vibrate(50);

    simDevice.classList.remove('alert-flashing');
    deviceIcon.textContent = '✅';
    deviceAlertTitle.textContent = 'ESTÁS A SALVO';
    deviceAlertTitle.style.color = '#66BB6A';
    deviceAlertMsg.textContent = 'Confirmación enviada a brigadistas y familiares.';
    lspInstruction.textContent = 'LSP: REPORTE REGISTRADO';
    updateSvgFloorPlan('safe');

    btnUserSafe.disabled = true;
    btnUserSos.disabled = true;

    simLogText.textContent = '1-Tap registrado (anti-rebote 1500ms OK). Trama SMS (<140 bytes) enviada.';
    dashUserStatus.textContent = '✓ A SALVO (Retirado de cola de búsqueda)';
    dashUserStatus.className = 'status-safe';
    dashActionHint.textContent = 'Sector despejado. Brigadista redirigido a zonas pendientes.';
    dashFamilyStatus.textContent = '✓ SMS Entregado: "Valeria está A SALVO en Zona Segura."';
  });

  btnUserSos.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastClickTime < 1500) return;
    lastClickTime = now;

    if ('vibrate' in navigator) navigator.vibrate([300, 100, 300]);

    simDevice.classList.remove('alert-flashing');
    deviceIcon.textContent = '🛡️';
    deviceAlertTitle.textContent = 'ALERTA SOS RECIBIDA';
    deviceAlertTitle.style.color = '#64B5F6';
    deviceAlertMsg.textContent = 'Brigadista asignado en camino a tu ubicación (Oficina 304).';
    lspInstruction.textContent = 'LSP: MANTÉN LA CALMA, AYUDA EN CAMINO';
    svgUserNode.setAttribute('fill', '#D32F2F');

    btnUserSos.disabled = true;

    simLogText.textContent = 'Paquete SOS transmitido con ficha médica y ubicación exacta Piso 3.';
    dashUserStatus.textContent = '🚨 SOLICITUD SOS ACTIVA - Oficina 304';
    dashUserStatus.className = 'status-sos';
    dashActionHint.textContent = 'ACCIÓN PRIORITARIA: Brigadista despachado con tarjetas visuales LSP.';
    dashFamilyStatus.textContent = 'Notificación de asistencia en curso enviada a red de apoyo.';
  });

  btnSimReset.addEventListener('click', () => {
    simDevice.classList.remove('alert-flashing');
    deviceIcon.textContent = '🛡️';
    deviceAlertTitle.textContent = 'MODO PROTEGIDO';
    deviceAlertTitle.style.color = '';
    deviceAlertMsg.textContent = 'Monitoreo activo de sensores sísmicos y de humo en el edificio.';
    deviceLspCard.hidden = true;
    updateSvgFloorPlan('reset');

    btnUserSafe.disabled = true;
    btnUserSos.disabled = true;

    simLogText.textContent = 'Sistema restablecido a modo Standby.';
    dashUserStatus.textContent = 'Sin emergencia activa';
    dashUserStatus.className = 'status-neutral';
    dashActionHint.textContent = 'El brigadista visualiza el censo preventivo del piso.';
    dashFamilyStatus.textContent = 'En espera de evento.';
  });

  /* ========================================================================
     6. VALIDACIÓN ACCESIBLE DEL FORMULARIO DE PILOTO (PA-11 & Tarea 5)
     ======================================================================== */
  const pilotForm = document.getElementById('pilotForm');
  const pilotName = document.getElementById('pilotName');
  const pilotOrg = document.getElementById('pilotOrg');
  const pilotEmail = document.getElementById('pilotEmail');
  const pilotSuccessMsg = document.getElementById('pilotSuccessMsg');

  function setFieldError(input, errorId, message) {
    const errEl = document.getElementById(errorId);
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      errEl.textContent = message;
    } else {
      input.removeAttribute('aria-invalid');
      errEl.textContent = '';
    }
  }

  pilotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    pilotSuccessMsg.hidden = true;

    let firstInvalid = null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!pilotName.value.trim()) {
      setFieldError(pilotName, 'err-pilotName', 'Ingresa el nombre completo del responsable.');
      firstInvalid = firstInvalid || pilotName;
    } else {
      setFieldError(pilotName, 'err-pilotName', '');
    }

    if (!pilotOrg.value.trim()) {
      setFieldError(pilotOrg, 'err-pilotOrg', 'Ingresa el nombre de la institución o empresa.');
      firstInvalid = firstInvalid || pilotOrg;
    } else {
      setFieldError(pilotOrg, 'err-pilotOrg', '');
    }

    if (!pilotEmail.value.trim() || !emailRegex.test(pilotEmail.value.trim())) {
      setFieldError(pilotEmail, 'err-pilotEmail', 'Ingresa un correo electrónico institucional válido.');
      firstInvalid = firstInvalid || pilotEmail;
    } else {
      setFieldError(pilotEmail, 'err-pilotEmail', '');
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    pilotSuccessMsg.textContent = `✓ Solicitud registrada para ${pilotOrg.value.trim()}. Nuestro equipo enviará el plan de despliegue piloto a ${pilotEmail.value.trim()}.`;
    pilotSuccessMsg.hidden = false;
    pilotForm.reset();
  });
});
