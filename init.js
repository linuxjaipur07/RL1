// ═══════════════════════════════════════════
// INIT — Runs after all scripts are loaded
// ═══════════════════════════════════════════
(async () => {
  // 1. Initialize EmailJS
  initEmailJS();

  // 2. Init DOM-dependent components
  initHeroSlider();
  startSlider();
  initAdminPanel();

  // 3. Render initial UI with local data
  renderGrid('homeGrid', products.slice(0,8));
  renderGrid('shopGrid', products);
  renderGrid('newGrid',  products);
  updateCart();
  updateWish();

  // 4. Load live data from Supabase (replaces local if connected)
  await loadProductsFromSupabase();
})();
