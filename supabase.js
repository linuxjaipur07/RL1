// ═══════════════════════════════════════════
// SUPABASE CLIENT (no npm needed!)
// ═══════════════════════════════════════════
const sb = {
  async get(table, filters = {}) {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=*&order=id.asc`;
    if (filters.eq) {
      for (const [col, val] of Object.entries(filters.eq)) {
        url += `&${col}=eq.${encodeURIComponent(val)}`;
      }
    }
    if (filters.contains) {
      for (const [col, val] of Object.entries(filters.contains)) {
        url += `&${col}=cs.{${val}}`;
      }
    }
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
    return res.json();
  },

  async post(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
    return res.json();
  },

  async delete(table, id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    return res.ok;
  }
};