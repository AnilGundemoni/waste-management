/**
 * ECOTRACK - Dashboard JavaScript Module
 * Handles dashboard-specific functionality
 */

'use strict';

// ============================================================
// Sidebar Management
// ============================================================
const Sidebar = (() => {
  function init() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const overlay = document.querySelector('.sidebar-overlay');

    toggleBtn?.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
      overlay?.classList.toggle('visible');
    });

    overlay?.addEventListener('click', () => {
      sidebar?.classList.remove('open');
      overlay?.classList.remove('visible');
    });

    // Active link
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.sidebar-link[href]').forEach(link => {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });
  }
  return { init };
})();

// ============================================================
// Mini Charts (Pure CSS/SVG sparklines)
// ============================================================
const Charts = (() => {
  function drawSparkline(canvas, data, color) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const max = Math.max(...data), min = Math.min(...data);
    const range = max - min || 1;
    const step = w / (data.length - 1);

    ctx.clearRect(0, 0, w, h);

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '00');

    ctx.beginPath();
    ctx.moveTo(0, h - ((data[0] - min) / range) * h);
    data.forEach((val, i) => {
      ctx.lineTo(i * step, h - ((val - min) / range) * h);
    });
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(0, h - ((data[0] - min) / range) * h);
    data.forEach((val, i) => {
      ctx.lineTo(i * step, h - ((val - min) / range) * h);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function initSparklines() {
    document.querySelectorAll('[data-sparkline]').forEach(canvas => {
      const data = canvas.dataset.sparkline.split(',').map(Number);
      const color = canvas.dataset.color || '#16a34a';
      drawSparkline(canvas, data, color);
    });
  }

  function drawDonut(canvas, percent, color) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 8;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (2 * Math.PI * percent / 100);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Filled arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Center text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(percent + '%', cx, cy);
  }

  function initDonuts() {
    document.querySelectorAll('[data-donut]').forEach(canvas => {
      const percent = parseInt(canvas.dataset.donut);
      const color = canvas.dataset.color || '#16a34a';
      drawDonut(canvas, percent, color);
    });
  }

  function init() {
    initSparklines();
    initDonuts();
  }

  return { init, drawSparkline, drawDonut };
})();

// ============================================================
// Data Table with Search & Sort
// ============================================================
const DataTable = (() => {
  function init(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const searchInput = document.querySelector(`[data-table-search="${tableId}"]`);
    const rows = Array.from(table.querySelectorAll('tbody tr'));

    // Search
    searchInput?.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    });

    // Sort on header click
    table.querySelectorAll('th[data-sort]').forEach(th => {
      th.style.cursor = 'pointer';
      th.addEventListener('click', () => {
        const col = Array.from(th.parentElement.children).indexOf(th);
        const asc = th.dataset.sortDir !== 'asc';
        th.dataset.sortDir = asc ? 'asc' : 'desc';

        const tbody = table.querySelector('tbody');
        rows.sort((a, b) => {
          const aVal = a.cells[col]?.textContent.trim() || '';
          const bVal = b.cells[col]?.textContent.trim() || '';
          return asc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });

        rows.forEach(row => tbody.appendChild(row));
        table.querySelectorAll('th[data-sort]').forEach(t => {
          if (t !== th) t.removeAttribute('data-sort-dir');
        });
      });
    });
  }
  return { init };
})();

// ============================================================
// Notification Panel
// ============================================================
const Notifications = (() => {
  let count = 3;

  function updateBadge() {
    const badge = document.querySelector('.notif-badge');
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  function markAllRead() {
    count = 0;
    updateBadge();
    document.querySelectorAll('.notif-item.unread').forEach(item => {
      item.classList.remove('unread');
    });
    window.EcoTrack?.Toast.show('All notifications marked as read.', 'success');
  }

  function init() {
    const bell = document.querySelector('.notif-bell');
    const panel = document.querySelector('.notif-panel');

    bell?.addEventListener('click', e => {
      e.stopPropagation();
      panel?.classList.toggle('open');
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('.notif-wrapper')) {
        panel?.classList.remove('open');
      }
    });

    document.querySelector('.mark-all-read')?.addEventListener('click', markAllRead);
    updateBadge();
  }

  return { init };
})();

// ============================================================
// Schedule Calendar
// ============================================================
const ScheduleCalendar = (() => {
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  let current = new Date(2026, 2, 1); // March 2026

  const pickups = {
    '2026-03-02': 'General Waste',
    '2026-03-05': 'Recycling',
    '2026-03-09': 'General Waste',
    '2026-03-12': 'Green Waste',
    '2026-03-16': 'General Waste',
    '2026-03-19': 'Recycling',
    '2026-03-23': 'Bulk Collection',
    '2026-03-26': 'General Waste',
    '2026-03-30': 'Recycling',
  };

  function pad(n) { return n < 10 ? '0' + n : n; }

  function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    let html = `
      <div class="cal-header">
        <button class="cal-nav" id="cal-prev"><i class="fas fa-chevron-left"></i></button>
        <h4>${MONTHS[month]} ${year}</h4>
        <button class="cal-nav" id="cal-next"><i class="fas fa-chevron-right"></i></button>
      </div>
      <div class="cal-grid">
        ${DAYS.map(d => `<div class="cal-day-name">${d}</div>`).join('')}
        ${Array(firstDay).fill('<div class="cal-cell empty"></div>').join('')}
    `;

    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${pad(month+1)}-${pad(d)}`;
      const pickup = pickups[key];
      const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      let cls = 'cal-cell';
      if (isToday) cls += ' today';
      if (pickup) cls += ' has-event';
      html += `<div class="${cls}" title="${pickup || ''}">${d}${pickup ? `<span class="cal-dot"></span>` : ''}</div>`;
    }

    html += '</div>';
    container.innerHTML = html;

    document.getElementById('cal-prev')?.addEventListener('click', () => {
      current = new Date(year, month - 1, 1);
      render(containerId);
    });
    document.getElementById('cal-next')?.addEventListener('click', () => {
      current = new Date(year, month + 1, 1);
      render(containerId);
    });
  }

  return { render };
})();

// ============================================================
// Bootstrap Dashboard
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  Sidebar.init();
  Charts.init();
  DataTable.init('clients-table');
  DataTable.init('pickups-table');
  Notifications.init();
  ScheduleCalendar.render('pickup-calendar');
});

window.EcoTrackDash = { Charts, DataTable, Notifications, ScheduleCalendar };
