const fs   = require('fs');
const path = require('path');
const dir  = 'C:/Users/rashe/My Projects/tahini-plus-menu';
let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

// ── 1. Firebase loader: handle arrays, show first photo ───────────
html = html.replace(
`/* ── Load food photos from Firebase ── */
(function() {
  var cfg = JSON.parse(localStorage.getItem('tahini-firebase-config') || 'null');
  if (!cfg) return;
  try {
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    firebase.firestore().collection('menu').doc('photos').get().then(function(doc) {
      if (!doc.exists) return;
      var data = doc.data();
      Object.keys(data).forEach(function(slug) {
        var url = data[slug]; if (!url) return;
        document.querySelectorAll('.item-photo[data-item="'+slug+'"]').forEach(function(el) {
          el.innerHTML = '<img src="'+url+'" alt="" style="width:100%;height:100%;object-fit:cover">';
        });
      });
    }).catch(function(){});
  } catch(e) {}
})();`,
`/* ── Load food photos from Firebase ── */
(function() {
  var cfg = JSON.parse(localStorage.getItem('tahini-firebase-config') || 'null');
  if (!cfg) return;
  try {
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    firebase.firestore().collection('menu').doc('photos').get().then(function(doc) {
      if (!doc.exists) return;
      var data = doc.data();
      Object.keys(data).forEach(function(slug) {
        var val = data[slug];
        // Support both old string format and new array format
        var urls = Array.isArray(val) ? val : (val ? [val] : []);
        if (!urls.length) return;
        window._photosMap = window._photosMap || {};
        window._photosMap[slug] = urls;
        document.querySelectorAll('.item-photo[data-item="'+slug+'"]').forEach(function(el) {
          el.innerHTML = '<img src="'+urls[0]+'" alt="" style="width:100%;height:100%;object-fit:cover">';
        });
      });
    }).catch(function(){});
  } catch(e) {}
})();`
);

// ── 2. Add lightbox CSS after .pe-toast.err rule ──────────────────
const TOAST_END = `.pe-toast.err   { background: oklch(40% 0.12 37); }`;
const LIGHTBOX_CSS = `
/* ─── Lightbox ───────────────────────────── */
.lb-overlay {
  position: fixed; inset: 0; z-index: 10000;
  background: oklch(5% 0.003 75 / 0.93);
  display: none; align-items: center; justify-content: center;
}
.lb-overlay.open { display: flex; }
.lb-img-wrap {
  max-width: calc(100vw - 140px); max-height: 85dvh;
  display: flex; align-items: center; justify-content: center;
}
.lb-img-wrap img {
  max-width: 100%; max-height: 85dvh;
  border-radius: 10px;
  object-fit: contain;
  box-shadow: 0 8px 40px oklch(0% 0 0 / 0.5);
  user-select: none;
}
.lb-arrow {
  position: fixed; top: 50%; transform: translateY(-50%);
  width: 52px; height: 52px; border-radius: 50%;
  background: oklch(98% 0.003 75 / 0.15);
  border: 1px solid oklch(98% 0.003 75 / 0.2);
  color: #fff; font-size: 1.6rem; line-height: 1;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.15s; backdrop-filter: blur(4px);
}
.lb-arrow:hover { background: oklch(98% 0.003 75 / 0.28); }
.lb-arrow:disabled { opacity: 0.2; cursor: default; }
.lb-prev { left: 1rem; }
.lb-next { right: 1rem; }
.lb-close {
  position: fixed; top: 1rem; right: 1rem;
  width: 40px; height: 40px; border-radius: 50%;
  background: oklch(98% 0.003 75 / 0.15);
  border: 1px solid oklch(98% 0.003 75 / 0.2);
  color: #fff; font-size: 1.4rem; line-height: 1;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.15s; backdrop-filter: blur(4px);
}
.lb-close:hover { background: oklch(98% 0.003 75 / 0.28); }
.lb-counter {
  position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
  background: oklch(98% 0.003 75 / 0.12); border: 1px solid oklch(98% 0.003 75 / 0.2);
  color: #fff; font-size: 0.8rem; padding: 0.35rem 1rem; border-radius: 20px;
  backdrop-filter: blur(4px); pointer-events: none;
}
.lb-edit {
  position: fixed; bottom: 1.5rem; right: 1.5rem;
  background: oklch(98% 0.003 75 / 0.12); border: 1px solid oklch(98% 0.003 75 / 0.2);
  color: #fff; font-size: 0.75rem; padding: 0.35rem 0.9rem; border-radius: 20px;
  cursor: pointer; font-family: var(--font-body);
  transition: background 0.15s; backdrop-filter: blur(4px);
}
.lb-edit:hover { background: oklch(98% 0.003 75 / 0.28); }

/* ─── Multi-photo editor grid ────────────── */
.pe-photos-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
}
.pe-photo-slot {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  border: 1.5px dashed oklch(80% 0.028 37);
  background: oklch(95.5% 0.009 37);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.pe-photo-slot img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.pe-photo-slot .pe-slot-remove {
  position: absolute; top: 2px; right: 2px;
  width: 20px; height: 20px; border-radius: 50%;
  background: oklch(20% 0.006 75 / 0.7); color: #fff;
  border: none; font-size: 0.8rem; line-height: 1;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.pe-photo-slot.pe-slot-add {
  flex-direction: column; gap: 0.2rem;
  font-size: 0.6rem; color: var(--ink-muted);
  transition: border-color 0.15s;
}
.pe-photo-slot.pe-slot-add:hover { border-color: var(--terracotta); }
.pe-photo-slot.pe-slot-add svg { opacity: 0.5; }
.pe-photos-hint {
  font-size: 0.72rem; color: var(--ink-muted); text-align: center;
}
.pe-add-area {
  display: flex; flex-direction: column; gap: 0.75rem;
  padding: 0.875rem; background: oklch(97.5% 0.006 82);
  border: 1px solid var(--border); border-radius: 10px;
}
.pe-add-area.hidden { display: none; }`;

html = html.replace(TOAST_END, TOAST_END + '\n' + LIGHTBOX_CSS);

// ── 3. Replace entire photo editor JS ────────────────────────────
const JS_START = `/* ── Photo editor — Firebase ────────────── */
document.addEventListener('DOMContentLoaded', function() {
(function() {`;
const JS_END   = `})();
}); // DOMContentLoaded`;

const si = html.indexOf(JS_START);
const ei = html.indexOf(JS_END);
if (si === -1 || ei === -1) { console.error('Could not find JS markers'); process.exit(1); }

const NEW_JS = `/* ── Photo editor + Lightbox — Firebase ── */
document.addEventListener('DOMContentLoaded', function() {
(function() {
  var FB_KEY = 'tahini-firebase-config';
  var fbApp = null, fbDb = null, fbStorage = null;

  // photosMap: slug → string[] (loaded on page start, kept in sync after edits)
  window._photosMap = window._photosMap || {};
  var photosMap = window._photosMap;

  // ── Editor state ──────────────────────────
  var currentSlug = null, currentEl = null;
  var currentPhotos = []; // working copy while editor is open
  var pendingFile = null, pendingUrl = null;
  var addingSlotIndex = -1; // which empty slot is being filled

  // ── DOM refs ─────────────────────────────
  var overlay    = document.getElementById('pe-overlay');
  var titleEl    = document.getElementById('pe-title');
  var photosGrid = document.getElementById('pe-photos-grid');
  var addArea    = document.getElementById('pe-add-area');
  var fileInput  = document.getElementById('pe-file-input');
  var urlInput   = document.getElementById('pe-url-input');
  var addPreview = document.getElementById('pe-add-preview');
  var setupBox   = document.getElementById('pe-setup-box');
  var configArea = document.getElementById('pe-firebase-config');
  var saveBtn    = document.getElementById('pe-save-btn');
  var cancelBtn  = document.getElementById('pe-cancel-btn');
  var closeBtn   = document.getElementById('pe-close');
  var toast      = document.getElementById('pe-toast');
  var toastTimer;

  // ── Lightbox refs ─────────────────────────
  var lbOverlay = document.getElementById('lb-overlay');
  var lbImg     = document.getElementById('lb-img');
  var lbPrev    = document.getElementById('lb-prev');
  var lbNext    = document.getElementById('lb-next');
  var lbClose   = document.getElementById('lb-close');
  var lbCounter = document.getElementById('lb-counter');
  var lbEdit    = document.getElementById('lb-edit');
  var lbSlug = null, lbPhotos = [], lbIndex = 0;

  // ── Firebase init ─────────────────────────
  function initFb(cfg) {
    if (fbApp) return true;
    try {
      fbApp = firebase.apps.length ? firebase.app() : firebase.initializeApp(cfg);
      fbDb = firebase.firestore();
      fbStorage = firebase.storage();
      return true;
    } catch(e) { return false; }
  }
  var saved = JSON.parse(localStorage.getItem(FB_KEY) || 'null');
  if (saved) initFb(saved);

  // ── Wire up photo placeholders ────────────
  document.querySelectorAll('.item-photo').forEach(function(el) {
    el.addEventListener('click', function() {
      var slug = el.getAttribute('data-item');
      var photos = photosMap[slug] || [];
      if (photos.length > 0) {
        openLightbox(slug, 0);
      } else {
        openEditor(el);
      }
    });
  });

  // ─────────────────────────────────────────
  // LIGHTBOX
  // ─────────────────────────────────────────
  function openLightbox(slug, index) {
    lbSlug   = slug;
    lbPhotos = (photosMap[slug] || []).slice();
    lbIndex  = index;
    renderLightbox();
    lbOverlay.classList.add('open');
  }

  function renderLightbox() {
    lbImg.src = lbPhotos[lbIndex] || '';
    lbCounter.textContent = (lbIndex + 1) + ' / ' + lbPhotos.length;
    lbPrev.disabled = lbIndex === 0;
    lbNext.disabled = lbIndex === lbPhotos.length - 1;
  }

  lbPrev.addEventListener('click', function() {
    if (lbIndex > 0) { lbIndex--; renderLightbox(); }
  });
  lbNext.addEventListener('click', function() {
    if (lbIndex < lbPhotos.length - 1) { lbIndex++; renderLightbox(); }
  });
  lbClose.addEventListener('click', closeLightbox);
  lbEdit.addEventListener('click', function() {
    closeLightbox();
    var el = document.querySelector('.item-photo[data-item="'+lbSlug+'"]');
    if (el) openEditor(el);
  });
  lbOverlay.addEventListener('click', function(e) {
    if (e.target === lbOverlay) closeLightbox();
  });
  document.addEventListener('keydown', function(e) {
    if (!lbOverlay.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  { if (lbIndex > 0) { lbIndex--; renderLightbox(); } }
    if (e.key === 'ArrowRight') { if (lbIndex < lbPhotos.length - 1) { lbIndex++; renderLightbox(); } }
    if (e.key === 'Escape') closeLightbox();
  });

  function closeLightbox() { lbOverlay.classList.remove('open'); }

  // ─────────────────────────────────────────
  // EDITOR
  // ─────────────────────────────────────────
  function openEditor(el) {
    currentEl   = el;
    currentSlug = el.getAttribute('data-item');
    currentPhotos = (photosMap[currentSlug] || []).slice();
    pendingFile = null; pendingUrl = null; addingSlotIndex = -1;

    var item   = el.closest('.item');
    var nameEl = item ? item.querySelector('.item-name') : null;
    titleEl.textContent = 'Edit Photos' + (nameEl ? ' · ' + nameEl.textContent.trim().slice(0, 24) : '');

    setupBox.style.display = localStorage.getItem(FB_KEY) ? 'none' : '';
    renderGrid();
    hideAddArea();
    overlay.classList.add('open');
  }

  function renderGrid() {
    photosGrid.innerHTML = '';
    currentPhotos.forEach(function(url, i) {
      var slot = document.createElement('div');
      slot.className = 'pe-photo-slot';
      slot.innerHTML = '<img src="'+url+'" alt="">'
        + '<button class="pe-slot-remove" data-idx="'+i+'" title="Remove">&times;</button>';
      photosGrid.appendChild(slot);
    });
    if (currentPhotos.length < 5) {
      var add = document.createElement('div');
      add.className = 'pe-photo-slot pe-slot-add';
      add.dataset.addSlot = 'true';
      add.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span>Add</span>';
      photosGrid.appendChild(add);
    }
    // hint
    document.getElementById('pe-photos-hint').textContent =
      currentPhotos.length + ' / 5 photos added';
  }

  // Delegate clicks in the grid
  photosGrid.addEventListener('click', function(e) {
    var removeBtn = e.target.closest('.pe-slot-remove');
    if (removeBtn) {
      var idx = parseInt(removeBtn.getAttribute('data-idx'), 10);
      currentPhotos.splice(idx, 1);
      renderGrid();
      // Update thumbnail if first photo changed
      updateThumbnail();
      hideAddArea();
      return;
    }
    var addSlot = e.target.closest('[data-add-slot]');
    if (addSlot) {
      pendingFile = null; pendingUrl = null;
      urlInput.value = '';
      addPreview.innerHTML = '';
      addArea.classList.remove('hidden');
      fileInput.value = '';
    }
  });

  function hideAddArea() { addArea.classList.add('hidden'); }

  function updateThumbnail() {
    if (!currentEl) return;
    if (currentPhotos.length > 0) {
      currentEl.innerHTML = '<img src="'+currentPhotos[0]+'" alt="" style="width:100%;height:100%;object-fit:cover">';
    } else {
      currentEl.innerHTML = '';
    }
  }

  // File pick
  fileInput.addEventListener('change', function() {
    var file = fileInput.files[0]; if (!file) return;
    pendingFile = file; pendingUrl = null; urlInput.value = '';
    var r = new FileReader();
    r.onload = function(ev) {
      addPreview.innerHTML = '<img src="'+ev.target.result+'" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">';
    };
    r.readAsDataURL(file);
  });

  // Drop onto add area
  addArea.addEventListener('dragover', function(e) { e.preventDefault(); });
  addArea.addEventListener('drop', function(e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    pendingFile = file; pendingUrl = null; urlInput.value = '';
    var r = new FileReader();
    r.onload = function(ev) {
      addPreview.innerHTML = '<img src="'+ev.target.result+'" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">';
    };
    r.readAsDataURL(file);
  });

  // Choose button
  document.addEventListener('click', function(e) {
    if (e.target.id === 'pe-choose-btn') fileInput.click();
  });

  // URL preview
  var urlTimer;
  urlInput.addEventListener('input', function() {
    clearTimeout(urlTimer);
    var url = urlInput.value.trim();
    if (!url) { pendingUrl = null; addPreview.innerHTML = ''; return; }
    urlTimer = setTimeout(function() {
      var img = new Image();
      img.onload = function() {
        pendingUrl = url; pendingFile = null;
        addPreview.innerHTML = '<img src="'+url+'" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">';
      };
      img.onerror = function() { pendingUrl = null; addPreview.innerHTML = '<p style="font-size:.75rem;color:var(--terracotta);padding:.5rem">Could not load this URL</p>'; };
      img.src = url;
    }, 500);
  });

  // "Add this photo" button in add area
  document.getElementById('pe-add-photo-btn').addEventListener('click', function() {
    if (!pendingFile && !pendingUrl) { showToast('Choose a photo first.', true); return; }
    if (currentPhotos.length >= 5) { showToast('Max 5 photos per item.', true); return; }

    if (pendingFile) {
      // Upload to Storage then add URL
      var btn = document.getElementById('pe-add-photo-btn');
      btn.disabled = true; btn.textContent = 'Uploading…';
      var ext = (pendingFile.name.split('.').pop() || 'jpg').toLowerCase().replace('jpeg','jpg');
      var ref = fbStorage.ref('menu-photos/' + currentSlug + '_' + Date.now() + '.' + ext);
      ref.put(pendingFile)
        .then(function() { return ref.getDownloadURL(); })
        .then(function(url) {
          currentPhotos.push(url);
          renderGrid();
          updateThumbnail();
          hideAddArea();
          btn.disabled = false; btn.textContent = 'Add this photo';
        })
        .catch(function(e) { showToast(e.message || 'Upload failed.', true); btn.disabled = false; btn.textContent = 'Add this photo'; });
    } else {
      currentPhotos.push(pendingUrl);
      renderGrid();
      updateThumbnail();
      hideAddArea();
    }
  });

  // Save all to Firestore
  saveBtn.addEventListener('click', function() {
    // First-time Firebase setup
    if (!localStorage.getItem(FB_KEY)) {
      var raw = (configArea.value || '').trim();
      if (!raw) { showToast('Paste your Firebase config first.', true); configArea.focus(); return; }
      var cfg;
      try {
        var json = raw.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
        cfg = JSON.parse(json);
        if (!cfg.apiKey || !cfg.projectId) throw new Error('missing fields');
      } catch(e) { showToast('Invalid config — paste just the { ... } object.', true); return; }
      if (!initFb(cfg)) { showToast('Could not connect to Firebase.', true); return; }
      localStorage.setItem(FB_KEY, JSON.stringify(cfg));
      setupBox.style.display = 'none';
      showToast('Connected to Firebase!');
    }

    saveBtn.disabled = true; saveBtn.textContent = 'Saving…';
    var update = {};
    update[currentSlug] = currentPhotos;
    fbDb.collection('menu').doc('photos').set(update, { merge: true })
      .then(function() {
        photosMap[currentSlug] = currentPhotos.slice();
        updateThumbnail();
        showToast(currentPhotos.length ? 'Photos saved!' : 'Photos cleared.');
        closeEditor();
        saveBtn.disabled = false; saveBtn.textContent = 'Save';
      })
      .catch(function(e) { showToast(e.message || 'Save failed.', true); saveBtn.disabled = false; saveBtn.textContent = 'Save'; });
  });

  function closeEditor() {
    overlay.classList.remove('open');
    currentEl = null; currentSlug = null; currentPhotos = [];
    pendingFile = null; pendingUrl = null;
  }

  closeBtn.addEventListener('click', closeEditor);
  cancelBtn.addEventListener('click', closeEditor);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeEditor(); });
  document.addEventListener('keydown', function(e) {
    if (overlay.classList.contains('open') && e.key === 'Escape') closeEditor();
  });

  function showToast(msg, isErr) {
    toast.textContent = msg;
    toast.className = 'pe-toast' + (isErr ? ' err' : '') + ' show';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() { toast.className = 'pe-toast'; }, 4000);
  }
})();
}); // DOMContentLoaded`;

html = html.slice(0, si) + NEW_JS + html.slice(ei + JS_END.length);

// ── 4. Replace modal HTML + add lightbox HTML ─────────────────────
const OLD_MODAL = `<!-- Photo editor modal -->
<div class="pe-overlay" id="pe-overlay" role="dialog" aria-modal="true">
  <div class="pe-panel">
    <div class="pe-head">
      <div class="pe-title" id="pe-title">Add Photo</div>
      <button class="pe-close" id="pe-close" aria-label="Close">&times;</button>
    </div>
    <div class="pe-body">
      <div class="pe-preview" id="pe-preview">
        <div class="pe-drop-zone" id="pe-drop-zone">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <div class="pe-drop-label">Drag &amp; drop a photo here<br>or</div>
          <button class="pe-drop-btn" id="pe-choose-btn">Choose from device</button>
          <input type="file" id="pe-file-input" accept="image/*" style="display:none">
        </div>
      </div>
      <div class="pe-or">or paste a URL</div>
      <input class="pe-url" id="pe-url-input" type="url" placeholder="https://i.imgur.com/example.jpg">
      <div class="pe-setup-box" id="pe-setup-box">
        <div class="pe-setup-title">One-time Firebase Setup</div>
        <ol class="pe-setup-steps">
          <li>Create a free project at <a href="https://console.firebase.google.com" target="_blank" rel="noopener">console.firebase.google.com</a></li>
          <li>Add a <strong>Web app</strong> &rarr; copy the <code>firebaseConfig</code> object</li>
          <li>Enable <strong>Firestore Database</strong> and <strong>Storage</strong></li>
          <li>Set both rules to: <code>allow read, write: if true;</code></li>
        </ol>
        <textarea id="pe-firebase-config" class="pe-config-area" placeholder='{"apiKey":"AIza...","projectId":"your-app","storageBucket":"your-app.appspot.com",...}'></textarea>
      </div>
    </div>
    <div class="pe-foot">
      <button class="pe-btn" id="pe-cancel-btn">Cancel</button>
      <button class="pe-btn pe-btn-primary" id="pe-save-btn">Save to Menu</button>
    </div>
  </div>
</div>
<div class="pe-toast" id="pe-toast"></div>`;

const NEW_MODAL = `<!-- Lightbox -->
<div class="lb-overlay" id="lb-overlay">
  <button class="lb-close" id="lb-close">&times;</button>
  <button class="lb-arrow lb-prev" id="lb-prev">&#8249;</button>
  <div class="lb-img-wrap"><img id="lb-img" src="" alt=""></div>
  <button class="lb-arrow lb-next" id="lb-next">&#8250;</button>
  <div class="lb-counter" id="lb-counter">1 / 1</div>
  <button class="lb-edit" id="lb-edit">Edit photos</button>
</div>

<!-- Photo editor modal -->
<div class="pe-overlay" id="pe-overlay" role="dialog" aria-modal="true">
  <div class="pe-panel">
    <div class="pe-head">
      <div class="pe-title" id="pe-title">Edit Photos</div>
      <button class="pe-close" id="pe-close" aria-label="Close">&times;</button>
    </div>
    <div class="pe-body">
      <!-- Current photos grid -->
      <div class="pe-photos-grid" id="pe-photos-grid"></div>
      <p class="pe-photos-hint" id="pe-photos-hint">0 / 5 photos added</p>

      <!-- Add new photo area (hidden until + slot clicked) -->
      <div class="pe-add-area hidden" id="pe-add-area">
        <div class="pe-preview" id="pe-add-preview" style="min-height:80px;border-radius:8px;background:oklch(95% 0.009 37);border:1.5px dashed oklch(80% 0.028 37);display:flex;align-items:center;justify-content:center;overflow:hidden;"></div>
        <div style="display:flex;gap:.5rem;align-items:center;">
          <button class="pe-drop-btn" id="pe-choose-btn" style="flex:1">Choose from device</button>
          <div class="pe-or" style="width:2rem;flex-shrink:0">or</div>
          <input class="pe-url" id="pe-url-input" type="url" placeholder="Paste image URL" style="flex:2">
        </div>
        <input type="file" id="pe-file-input" accept="image/*" style="display:none">
        <button class="pe-btn pe-btn-primary" id="pe-add-photo-btn" style="width:100%">Add this photo</button>
      </div>

      <div class="pe-setup-box" id="pe-setup-box">
        <div class="pe-setup-title">One-time Firebase Setup</div>
        <ol class="pe-setup-steps">
          <li>Create a free project at <a href="https://console.firebase.google.com" target="_blank" rel="noopener">console.firebase.google.com</a></li>
          <li>Add a <strong>Web app</strong> &rarr; copy the <code>firebaseConfig</code> object</li>
          <li>Enable <strong>Firestore Database</strong> and <strong>Storage</strong></li>
          <li>Set both rules to: <code>allow read, write: if true;</code></li>
        </ol>
        <textarea id="pe-firebase-config" class="pe-config-area" placeholder='{"apiKey":"AIza...","projectId":"your-app","storageBucket":"your-app.appspot.com",...}'></textarea>
      </div>
    </div>
    <div class="pe-foot">
      <button class="pe-btn" id="pe-cancel-btn">Cancel</button>
      <button class="pe-btn pe-btn-primary" id="pe-save-btn">Save</button>
    </div>
  </div>
</div>
<div class="pe-toast" id="pe-toast"></div>`;

if (!html.includes(OLD_MODAL)) { console.error('Modal HTML not found'); process.exit(1); }
html = html.replace(OLD_MODAL, NEW_MODAL);

fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');

// Verify
const final = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
console.log('Lightbox CSS added:',  final.includes('.lb-overlay'));
console.log('Multi-photo grid CSS:', final.includes('.pe-photos-grid'));
console.log('Lightbox HTML added:', final.includes('id="lb-overlay"'));
console.log('New editor HTML:',     final.includes('id="pe-photos-grid"'));
console.log('New JS:',              final.includes('openLightbox'));
console.log('Array save:',          final.includes('currentPhotos'));
console.log('GitHub API gone:',     !final.includes('api.github.com'));
