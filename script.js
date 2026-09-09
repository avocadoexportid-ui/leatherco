/* ══════════════════════════════════════════
   LEATHER & CO — Interaksi & Data
   ══════════════════════════════════════════ */

/* ---------- Data Produk ---------- */
const PRODUCTS = [
  { id: 1, name: "Atlas Tote — Cognac",        cat: "tote",      price: 2850000, tag: "bestseller", seed: "bag-atlas",    featured: true,
    desc: "Tote ukuran penuh dari full-grain cowhide tumbuh. Dilapisi satu lapis beeswax agar tahan cuaca, dengan satu kompartemen laptop berbantalan." },
  { id: 2, name: "Heritage Tote No. 1",        cat: "tote",      price: 3850000, tag: "bestseller", seed: "bag-heritage", featured: true,
    desc: "Siluet arsip pertama kami tahun 1998, dijahit ulang dengan teknik saddle-stitch. Setiap unit membutuhkan 14 jam kerja tangan satu artisan." },
  { id: 3, name: "Siena Tote — Sand",          cat: "tote",      price: 2450000, tag: "new",        seed: "bag-siena",
    desc: "Nuansa pasir hangat dari proses vegetable tanning alami. Ringan, lentur, dan akan menggelapkan warnanya seiring usia pakai." },
  { id: 4, name: "Milano Crossbody — Espresso",cat: "crossbody", price: 1950000, tag: "new",        seed: "bag-milano",   featured: true,
    desc: "Ukuran kompak untuk kota. Tali kulit dapat disesuaikan, magnet flap tersembunyi, dan lapisan beludro lembut di bagian dalam." },
  { id: 5, name: "Luna Mini Crossbody",        cat: "crossbody", price: 1450000, sale: 1160000,      seed: "bag-luna",
    desc: "Mini tapi lapar ruang: empat kartu, ponsel, dan dompet kecil muat sempurna. Pilihan ideal untuk dilepas dari tas besar." },
  { id: 6, name: "Onyx Crossbody",             cat: "crossbody", price: 2150000, stock: 0,          seed: "bag-onyx",
    desc: "Kulit hitam pekat dengan hardware gunmetal anti-karat. Stok batch berikutnya dibuka akhir bulan ini." },
  { id: 7, name: "Nomad Backpack — Black",     cat: "backpack",  price: 3450000, tag: "",           seed: "bag-nomad",    featured: true,
    desc: "Dirancang untuk komuter: panel punggung berventilasi, kompartemen laptop 16 inci, dan roll-top yang bisa mengembang." },
  { id: 8, name: "Voyager Backpack — Umber",   cat: "backpack",  price: 3150000, sale: 2520000,      seed: "bag-voyager",
    desc: "Volume 22L untuk perjalanan singkat. Tali bahu full-grain dengan bantalan wool felt yang menyerap tekanan." },
];

const fmt = n => "Rp " + n.toLocaleString("id-ID");
const imgUrl = (seed, w, h) => `https://picsum.photos/seed/${seed}/${w}/${h}.jpg`;
const CAT_LABEL = { tote: "Tote Bag", crossbody: "Crossbody", backpack: "Backpack" };
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ---------- State (persisten via localStorage) ---------- */
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem("lc_" + k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem("lc_" + k, JSON.stringify(v)),
};
let cart     = store.get("cart", []);      // [{id, qty}]
let wishlist = new Set(store.get("wishlist", []));
let user     = store.get("user", null);
let activeFilter = "all";
let qvProduct = null, qvQty = 1;

/* ---------- Toast ---------- */
function toast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<span class="dot-t"></span><span>${msg}</span>`;
  $("#toastWrap").appendChild(el);
  setTimeout(() => { el.classList.add("out"); el.addEventListener("animationend", () => el.remove()); }, 2800);
}

/* ---------- Render Marquee ---------- */
(function buildMarquee() {
  const items = [
    "Gratis Ongkos Kirim untuk Order di atas Rp 1.500.000",
    "Handcrafted in Bandung, Indonesia",
    "Pembayaran via Midtrans & COD",
    "Garansi Jahitan Seumur Hidup",
  ];
  const half = items.map(t => `<span>${t}</span><span class="dot"></span>`).join("");
  $("#marqueeTrack").innerHTML = half + half; // diduplikasi agar loop mulus
})();

/* ---------- Kartu Produk ---------- */
function cardHTML(p) {
  const soldout = p.stock === 0;
  const wished  = wishlist.has(p.id);
  const priceHTML = p.sale
    ? `<s>${fmt(p.price)}</s> <span class="now-sale">${fmt(p.sale)}</span>`
    : fmt(p.price);
  const tagClass = p.tag === "bestseller" ? "bestseller" : p.tag === "new" ? "new" : "sale";
  const tagLabel = p.tag === "bestseller" ? "Bestseller" : p.tag === "new" ? "New" : "Sale";
  return `
  <article class="p-card ${soldout ? "soldout" : ""}" data-id="${p.id}">
    <div class="p-media" data-open-qv="${p.id}" role="button" tabindex="0" aria-label="Lihat ${p.name}">
      <img src="${imgUrl(p.seed, 640, 800)}" alt="${p.name} — tas kulit premium" loading="lazy">
      ${p.tag ? `<span class="p-tag ${tagClass}">${tagLabel}</span>` : ""}
      ${soldout ? `<div class="p-soldout"><span>Sold Out</span></div>` : ""}
      <div class="p-actions">
        <button class="p-add" data-add="${p.id}" ${soldout ? "disabled" : ""}>Add to Bag</button>
        <button class="p-wish ${wished ? "active" : ""}" data-wish="${p.id}" aria-label="Wishlist">
          <svg viewBox="0 0 24 24"><path d="M12 20.5C7 16.5 3 13.3 3 9.3 3 6.4 5.2 4.5 7.7 4.5c1.7 0 3.3.9 4.3 2.4a5.1 5.1 0 0 1 4.3-2.4c2.5 0 4.7 1.9 4.7 4.8 0 4-4 7.2-9 11.2Z"/></svg>
        </button>
      </div>
    </div>
    <div class="p-info">
      <p class="p-cat">${CAT_LABEL[p.cat]}</p>
      <h3 class="p-name" data-open-qv="${p.id}">${p.name}</h3>
      <p class="p-price">${priceHTML}</p>
    </div>
  </article>`;
}

function renderFeatured() {
  $("#featuredGrid").innerHTML = PRODUCTS.filter(p => p.featured).map(cardHTML).join("");
}
function renderGrid() {
  const list = activeFilter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.cat === activeFilter);
  $("#productGrid").innerHTML = list.map(cardHTML).join("");
  $("#emptyMsg").hidden = list.length > 0;
}
function rerenderAll() { renderFeatured(); renderGrid(); }

/* ---------- Keranjang ---------- */
function cartCount()  { return cart.reduce((s, i) => s + i.qty, 0); }
function cartTotal()  { return cart.reduce((s, i) => { const p = PRODUCTS.find(x => x.id === i.id); return s + (p.sale ?? p.price) * i.qty; }, 0); }

function saveCart() {
  store.set("cart", cart);
  const n = cartCount();
  ["#cartBadge", "#cartFloatBadge"].forEach(s => {
    const b = $(s); b.textContent = n; b.hidden = n === 0;
  });
  $("#drawerCount").textContent = `(${n})`;
  $("#cartTotal").textContent = fmt(cartTotal());
}

function addToCart(id, qty = 1) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p || p.stock === 0) return;
  const line = cart.find(i => i.id === id);
  line ? line.qty += qty : cart.push({ id, qty });
  saveCart(); renderDrawer();
  toast(`${p.name} ditambahkan ke tas`);
}

function renderDrawer() {
  const wrap = $("#drawerItems");
  if (cart.length === 0) {
    wrap.innerHTML = `<div class="drawer-empty"><div>
      <p>Tas belanja Anda masih kosong.</p>
      <button class="text-link" data-close>Lihat Koleksi</button></div></div>`;
    $("#drawerFoot").style.display = "none";
    return;
  }
  $("#drawerFoot").style.display = "";
  wrap.innerHTML = cart.map(i => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return `<div class="d-item">
      <img src="${imgUrl(p.seed, 160, 200)}" alt="${p.name}">
      <div>
        <h5>${p.name}</h5>
        <p class="d-price">${fmt((p.sale ?? p.price) * i.qty)}</p>
        <div class="qty-ctrl">
          <button data-qty="minus" data-id="${p.id}" aria-label="Kurangi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg></button>
          <b>${i.qty}</b>
          <button data-qty="plus" data-id="${p.id}" aria-label="Tambah"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></button>
        </div>
      </div>
      <button class="d-remove" data-remove="${p.id}" aria-label="Hapus item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>`;
  }).join("");
}

/* ---------- Wishlist ---------- */
function toggleWish(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (wishlist.has(id)) { wishlist.delete(id); toast(`${p.name} dihapus dari wishlist`); }
  else { wishlist.add(id); toast(`${p.name} disimpan ke wishlist`); }
  store.set("wishlist", [...wishlist]);
  // sinkronkan semua tombol heart dengan id sama
  $$(`[data-wish="${id}"]`).forEach(b => b.classList.toggle("active", wishlist.has(id)));
  const qvw = $("#quickView .qv-wish");
  if (qvProduct && qvProduct.id === id && qvw) qvw.classList.toggle("active", wishlist.has(id));
}

/* ---------- Quick View ---------- */
function openQuickView(id) {
  qvProduct = PRODUCTS.find(x => x.id === id);
  qvQty = 1;
  const p = qvProduct;
  const soldout = p.stock === 0;
  const priceHTML = p.sale ? `<s>${fmt(p.price)}</s> <span class="now-sale">${fmt(p.sale)}</span>` : fmt(p.price);
  $("#quickViewCard").innerHTML = `
    <button class="icon-btn close-btn" data-close aria-label="Tutup" style="position:absolute;top:.8rem;right:.8rem;z-index:2">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
    <div class="qv-grid">
      <div class="qv-img"><img src="${imgUrl(p.seed, 800, 1000)}" alt="${p.name}"></div>
      <div class="qv-body">
        <p class="p-cat">${CAT_LABEL[p.cat]} · Full-Grain Leather</p>
        <h3 class="p-name">${p.name}</h3>
        <p class="p-price" style="font-size:1.05rem">${priceHTML}</p>
        <p class="qv-desc">${p.desc}</p>
        ${soldout
          ? `<p class="qv-out">Stok Habis — Hubungi kami untuk batch berikutnya</p>`
          : `<div class="qv-row">
              <div class="qty-ctrl">
                <button id="qvMinus" aria-label="Kurangi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg></button>
                <b id="qvQty">1</b>
                <button id="qvPlus" aria-label="Tambah"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></button>
              </div>
              <button class="btn btn-dark" id="qvAdd">Add to Bag</button>
            </div>`}
        <button class="qv-wish ${wishlist.has(p.id) ? "active" : ""}" data-wish="${p.id}">
          <svg viewBox="0 0 24 24"><path d="M12 20.5C7 16.5 3 13.3 3 9.3 3 6.4 5.2 4.5 7.7 4.5c1.7 0 3.3.9 4.3 2.4a5.1 5.1 0 0 1 4.3-2.4c2.5 0 4.7 1.9 4.7 4.8 0 4-4 7.2-9 11.2Z"/></svg>
          Simpan ke Wishlist
        </button>
      </div>
    </div>`;
  openModal("#quickView");

  if (!soldout) {
    $("#qvMinus").onclick = () => { qvQty = Math.max(1, qvQty - 1); $("#qvQty").textContent = qvQty; };
    $("#qvPlus").onclick  = () => { qvQty++; $("#qvQty").textContent = qvQty; };
    $("#qvAdd").onclick   = () => { addToCart(p.id, qvQty); closeModal(); openDrawer(); };
  }
}

/* ---------- Overlay / Drawer / Modal ---------- */
const backdrop = $("#backdrop");
function openDrawer()    { renderDrawer(); $("#cartDrawer").classList.add("open"); backdrop.classList.add("show"); document.body.classList.add("locked"); $("#cartDrawer").setAttribute("aria-hidden", "false"); }
function closeDrawer()   { $("#cartDrawer").classList.remove("open"); maybeUnlock(); $("#cartDrawer").setAttribute("aria-hidden", "true"); }
function openSearch()    { $("#searchOverlay").classList.add("open"); backdrop.classList.add("show"); document.body.classList.add("locked"); $("#searchInput").focus(); $("#searchOverlay").setAttribute("aria-hidden", "false"); }
function closeSearch()   { $("#searchOverlay").classList.remove("open"); maybeUnlock(); $("#searchOverlay").setAttribute("aria-hidden", "true"); }
function openModal(sel)  { $(sel).classList.add("open"); backdrop.classList.add("show"); document.body.classList.add("locked"); $(sel).setAttribute("aria-hidden", "false"); }
function closeModal(sel) { const m = sel ?? ".modal.open"; const el = $(m); if (!el) return; el.classList.remove("open"); el.setAttribute("aria-hidden", "true"); maybeUnlock(); }
function anyOverlayOpen(){ return $("#cartDrawer").classList.contains("open") || $("#searchOverlay").classList.contains("open") || $("#mobileNav").classList.contains("open") || $(".modal.open"); }
function maybeUnlock()   { if (!anyOverlayOpen()) { backdrop.classList.remove("show"); document.body.classList.remove("locked"); } }
function closeAll()      { closeDrawer(); closeSearch(); closeModal(); $("#mobileNav").classList.remove("open"); maybeUnlock(); }

/* ---------- Pencarian ---------- */
function doSearch(q) {
  const wrap = $("#searchResults");
  q = q.trim().toLowerCase();
  if (!q) { wrap.innerHTML = `<p class="s-hint">Ketik untuk mulai mencari — coba "tote" atau "backpack".</p>`; return; }
  const hits = PRODUCTS.filter(p => (p.name + " " + p.cat).toLowerCase().includes(q)).slice(0, 6);
  wrap.innerHTML = hits.length
    ? hits.map(p => `<button class="s-result" data-open-qv="${p.id}">
        <img src="${imgUrl(p.seed, 120, 150)}" alt="">
        <span><span class="n">${p.name}</span><br><span class="c">${CAT_LABEL[p.cat]}</span></span>
        <span class="p">${fmt(p.sale ?? p.price)}</span>
      </button>`).join("")
    : `<p class="s-hint">Tidak ditemukan hasil untuk "${q}".</p>`;
}

/* ---------- Akun ---------- */
function renderAccount() {
  const init = $("#accountInitial");
  if (user) { init.textContent = user.name.charAt(0).toUpperCase(); init.hidden = false; }
  else init.hidden = true;

  $("#accountBody").innerHTML = user
    ? `<h3>Halo, ${user.name.split(" ")[0]}</h3>
       <p>Anda masuk sebagai <strong>${user.email}</strong>. Wishlist dan tas belanja Anda tersimpan di perangkat ini.</p>
       <div class="account-hello"><span class="avatar">${user.name.charAt(0).toUpperCase()}</span>
       <span style="font-size:.9rem;color:var(--muted)">Member LEATHER & CO</span></div>
       <button class="btn btn-dark btn-block" id="logoutBtn">Keluar</button>`
    : `<h3>Masuk</h3><p>Masuk untuk menyimpan wishlist dan riwayat pesanan Anda.</p>
       <form id="loginForm" novalidate>
         <label for="accName">Nama</label>
         <input id="accName" type="text" placeholder="Nama Anda" required>
         <label for="accEmail">Email</label>
         <input id="accEmail" type="email" placeholder="nama@email.com" required>
         <button type="submit" class="btn btn-dark btn-block">Masuk</button>
       </form>`;
}

/* ---------- Event Delegation Global ---------- */
document.addEventListener("click", e => {
  const t = e.target;

  // Buka quick view (klik gambar / nama / hasil pencarian)
  const qv = t.closest("[data-open-qv]");
  if (qv) {
    closeSearch();
    if ($("#mobileNav").classList.contains("open")) $("#mobileNav").classList.remove("open");
    openQuickView(+qv.dataset.openQv);
    return;
  }
  // Tambah ke tas
  const add = t.closest("[data-add]");
  if (add && !add.disabled) { addToCart(+add.dataset.add); return; }
  // Wishlist
  const wish = t.closest("[data-wish]");
  if (wish) { toggleWish(+wish.dataset.wish); return; }
  // Qty drawer
  const qtyBtn = t.closest("[data-qty]");
  if (qtyBtn) {
    const line = cart.find(i => i.id === +qtyBtn.dataset.id);
    if (!line) return;
    qtyBtn.dataset.qty === "plus" ? line.qty++ : (line.qty--, line.qty <= 0 && (cart = cart.filter(i => i.id !== line.id)));
    saveCart(); renderDrawer(); return;
  }
  // Hapus item
  const rm = t.closest("[data-remove]");
  if (rm) { cart = cart.filter(i => i.id !== +rm.dataset.remove); saveCart(); renderDrawer(); return; }
  // Tombol close universal
  if (t.closest("[data-close]")) { closeAll(); return; }

  // Filter kategori via kartu kategori
  const cat = t.closest(".category-card");
  if (cat) { setFilter(cat.dataset.cat); return; }
});

// Keyboard: Enter pada media produk juga membuka quick view
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.matches("[data-open-qv]")) openQuickView(+e.target.dataset.openQv);
  if (e.key === "Escape") closeAll();
});

/* ---------- Filter Tabs ---------- */
function setFilter(cat) {
  activeFilter = cat;
  $$(".filter-btn").forEach(b => b.classList.toggle("active", b.dataset.filter === cat));
  renderGrid();
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
}
 $("#filterTabs").addEventListener("click", e => {
  const b = e.target.closest(".filter-btn");
  if (b) { activeFilter = b.dataset.filter; $$(".filter-btn").forEach(x => x.classList.toggle("active", x === b)); renderGrid(); }
});

/* ---------- Header & Ikon ---------- */
 $("#cartBtn").onclick    = openDrawer;
 $("#cartFloat").onclick  = openDrawer;
 $("#searchBtn").onclick  = openSearch;
 $("#accountBtn").onclick = () => { renderAccount(); openModal("#accountModal"); };
 $("#hamburgerBtn").onclick = () => {
  const nav = $("#mobileNav");
  nav.classList.toggle("open");
  nav.classList.contains("open")
    ? (backdrop.classList.add("show"), document.body.classList.add("locked"))
    : maybeUnlock();
};
 $$(".mobile-nav a").forEach(a => a.onclick = () => { $("#mobileNav").classList.remove("open"); maybeUnlock(); });
backdrop.onclick = closeAll;

// Header shadow saat scroll + tampilkan floating cart
window.addEventListener("scroll", () => {
  $("#header").classList.toggle("scrolled", scrollY > 8);
  $("#cartFloat").classList.toggle("show", scrollY > 420);
}, { passive: true });

/* ---------- Checkout ---------- */
 $("#checkoutBtn").onclick = () => {
  toast("Demo toko — checkout terhubung Midtrans & COD di produksi");
};

/* ---------- Search live ---------- */
 $("#searchInput").addEventListener("input", e => doSearch(e.target.value));
 $("#searchInput").addEventListener("keydown", e => { if (e.key === "Enter") doSearch(e.target.value); });
 $("#searchOverlay").addEventListener("click", e => { if (e.target === e.currentTarget) closeSearch(); });

/* ---------- Form: Login & Newsletter ---------- */
document.addEventListener("submit", e => {
  if (e.target.id === "loginForm") {
    e.preventDefault();
    const name = $("#accName").value.trim(), email = $("#accEmail").value.trim();
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast("Mohon isi nama dan email yang valid"); return; }
    user = { name, email }; store.set("user", user);
    renderAccount(); toast(`Selamat datang, ${name.split(" ")[0]}`);
  }
  if (e.target.id === "newsletterForm") {
    e.preventDefault();
    const v = $("#newsletterEmail").value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { toast("Masukkan alamat email yang valid"); return; }
    const subs = store.get("news", []); subs.push(v); store.set("news", subs);
    $("#newsletterEmail").value = "";
    toast("Terima kasih — Anda terdaftar di newsletter kami");
  }
});
document.addEventListener("click", e => {
  if (e.target.id === "logoutBtn") { user = null; store.set("user", null); renderAccount(); toast("Anda telah keluar"); }
});

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); } });
}, { threshold: .12 });
 $$(".reveal").forEach(el => io.observe(el));

/* ---------- Init ---------- */
rerenderAll();
saveCart();
renderDrawer();
renderAccount();
doSearch("");
</script>
