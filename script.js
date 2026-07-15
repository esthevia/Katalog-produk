// ============================================
// ESTHÉVIA — filter kategori + sub-kategori fashion + gender
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('#productGrid .card');
  const emptyState = document.getElementById('emptyState');
  const fashionSubfilter = document.getElementById('fashionSubfilter');

  // state filter aktif: kategori, sub-kategori (khusus fashion), & gender
  const activeFilter = {
    category: 'all',
    subcategory: 'all',
    gender: 'all'
  };

  function applyFilters() {
    let visibleCount = 0;

    cards.forEach(card => {
      const matchCategory = activeFilter.category === 'all' || card.dataset.category === activeFilter.category;

      // sub-kategori cuma berlaku kalau lagi filter "fashion" dan kartunya memang fashion
      const isFashionFilter = activeFilter.category === 'fashion';
      const matchSubcategory = !isFashionFilter
        || activeFilter.subcategory === 'all'
        || card.dataset.subcategory === activeFilter.subcategory;

      const matchGender = activeFilter.gender === 'all' || card.dataset.gender === activeFilter.gender;

      const match = matchCategory && matchSubcategory && matchGender;

      card.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });

    emptyState.hidden = visibleCount !== 0;
  }

  function resetSubcategoryPills() {
    const subPills = document.querySelectorAll('.filter-pill[data-filter-type="subcategory"]');
    subPills.forEach(p => p.classList.remove('is-active'));
    document.querySelector('.filter-pill[data-filter-type="subcategory"][data-filter="all"]').classList.add('is-active');
    activeFilter.subcategory = 'all';
  }

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const type = pill.dataset.filterType; // "category", "subcategory", atau "gender"
      const value = pill.dataset.filter;

      // update tombol aktif hanya di dalam grup filter yang sama
      const groupPills = document.querySelectorAll(`.filter-pill[data-filter-type="${type}"]`);
      groupPills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');

      activeFilter[type] = value;

      // munculkan/sembunyikan sub-filter fashion sesuai kategori yang dipilih
      if (type === 'category') {
        if (value === 'fashion') {
          fashionSubfilter.hidden = false;
        } else {
          fashionSubfilter.hidden = true;
          resetSubcategoryPills();
        }
      }

      applyFilters();
    });
  });

  // ===== carousel Look Pilihan: geser pakai tombol panah / dots / swipe =====
  const lookGrid = document.getElementById('lookGrid');
  const lookPrev = document.getElementById('lookPrev');
  const lookNext = document.getElementById('lookNext');
  const lookDotsWrap = document.getElementById('lookDots');

  if (lookGrid) {
    const lookCards = lookGrid.querySelectorAll('.look-card');

    // bikin titik indikator sejumlah look yang ada
    lookCards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'look-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Ke Look ${i + 1}`);
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', () => {
        lookGrid.scrollTo({ left: lookGrid.clientWidth * i, behavior: 'smooth' });
      });
      lookDotsWrap.appendChild(dot);
    });

    const dots = lookDotsWrap.querySelectorAll('.look-dot');

    function updateActiveDot() {
      const index = Math.round(lookGrid.scrollLeft / lookGrid.clientWidth);
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    }

    lookGrid.addEventListener('scroll', () => {
      window.requestAnimationFrame(updateActiveDot);
    });

    lookPrev.addEventListener('click', () => {
      lookGrid.scrollBy({ left: -lookGrid.clientWidth, behavior: 'smooth' });
    });
    lookNext.addEventListener('click', () => {
      lookGrid.scrollBy({ left: lookGrid.clientWidth, behavior: 'smooth' });
    });
  }

  // ===== kartu amplop "Ada Saran atau Kritik?" — kirim pesan otomatis ke Telegram =====
  //
  // CARA SETUP (wajib diisi sebelum fitur ini bisa jalan):
  // 1. Buka Telegram, cari @BotFather, kirim /newbot, ikuti instruksinya.
  //    BotFather bakal kasih "Bot Token" (contoh: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ)
  // 2. Cari @userinfobot di Telegram, kirim pesan apa aja, dia bakal balas "Chat ID" kamu (angka).
  // 3. Kirim 1 pesan apa aja ke bot yang baru kamu bikin tadi (wajib, biar bot boleh membalas/mengirim ke kamu).
  // 4. Ganti 2 nilai di bawah ini dengan Bot Token & Chat ID kamu.
  const TELEGRAM_BOT_TOKEN = '8918033817:AAG3rkfb1mrwugLF5AfAyeCl6pUT8205Tv4';
  const TELEGRAM_CHAT_ID = '1367121868';

  const envelopeForm = document.getElementById('envelopeForm');

  if (envelopeForm) {
    envelopeForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const messageInput = document.getElementById('envelopeMessage');
      const hint = document.getElementById('envelopeHint');
      const submitBtn = document.getElementById('envelopeSubmit');

      const message = messageInput.value.trim();

      if (!message) {
        messageInput.focus();
        return;
      }

      const isConfigured = !TELEGRAM_BOT_TOKEN.includes('GANTI_') && !TELEGRAM_CHAT_ID.includes('GANTI_');

      if (!isConfigured) {
        hint.textContent = 'Fitur ini belum aktif — Bot Token & Chat ID Telegram belum dipasang di script.js.';
        hint.hidden = false;
        return;
      }

      const text = [
        '💌 Pesan baru dari website Esthévia',
        '',
        message
      ].join('\n');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Mengirim...';
      hint.hidden = true;

      try {
        const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text })
        });

        if (!res.ok) throw new Error('Gagal mengirim');

        hint.textContent = 'Berhasil terkirim, Terimakasih!💗';
        hint.hidden = false;
        envelopeForm.reset();
      } catch (err) {
        hint.textContent = 'Waduh, pesan gagal terkirim. Coba lagi sebentar lagi ya';
        hint.hidden = false;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kirim';
      }
    });
  }
});