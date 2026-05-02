// ═══════════════════════════════════════════
// PRODUCTS — Ethical, Office & Decent Wear
// ═══════════════════════════════════════════
let products = [
  // WOMEN — Office & Professional
  {id:1,  name:"Tailored Linen Blazer",      price:385, cat:"Women", tags:["Office","New","Ethical"],
   img:"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600"},
  {id:2,  name:"Silk Office Blouse",          price:245, cat:"Women", tags:["Office","Ethical"],
   img:"https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=600"},
  {id:3,  name:"Pencil Midi Skirt",           price:220, cat:"Women", tags:["Office","Decent"],
   img:"https://images.unsplash.com/photo-1551232864-3f0890e1777d?w=600"},
  {id:4,  name:"Structured Work Dress",       price:380, cat:"Women", tags:["Office","New","Ethical"],
   img:"https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600"},
  {id:5,  name:"Ethical Wool Trousers",       price:295, cat:"Women", tags:["Office","Ethical","Decent"],
   img:"https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600"},
  {id:6,  name:"Cotton Roll-Neck Top",        price:165, cat:"Women", tags:["Decent","Minimalist"],
   img:"https://images.unsplash.com/photo-1614975059251-992f11792b9f?w=600"},
  {id:7,  name:"Modest Wrap Dress",           price:310, cat:"Women", tags:["Decent","New","Ethical"],
   img:"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600"},
  {id:8,  name:"Organic Cotton Cardigan",     price:195, cat:"Women", tags:["Ethical","Decent"],
   img:"https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600"},

  // MEN — Professional & Tailored
  {id:9,  name:"Tailored Suit Jacket",        price:520, cat:"Men",   tags:["Office","New","Ethical"],
   img:"https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600"},
  {id:10, name:"Slim Fit Dress Trousers",     price:265, cat:"Men",   tags:["Office","Decent"],
   img:"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600"},
  {id:11, name:"Organic Oxford Shirt",        price:185, cat:"Men",   tags:["Office","Ethical","New"],
   img:"https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600"},
  {id:12, name:"Merino Wool Sweater",         price:295, cat:"Men",   tags:["Decent","Ethical"],
   img:"https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600"},
  {id:13, name:"Linen Formal Trousers",       price:210, cat:"Men",   tags:["Office","Ethical"],
   img:"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600"},
  {id:14, name:"Sustainable Chino",           price:185, cat:"Men",   tags:["Decent","Minimalist","New"],
   img:"https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600"},

  // ACCESSORIES — Professional
  {id:15, name:"Leather Portfolio Bag",       price:340, cat:"Accessories", tags:["Office","New"],
   img:"https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600"},
  {id:16, name:"Leather Belt Bag",            price:285, cat:"Accessories", tags:["Office","Ethical"],
   img:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600"},
  {id:17, name:"Silk Work Scarf",             price:125, cat:"Accessories", tags:["Office","Decent"],
   img:"https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600"},
  {id:18, name:"Classic Leather Belt",        price:95,  cat:"Accessories", tags:["Decent","Minimalist"],
   img:"https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600"},
];

// ═══════════════════════════════════════════
// SUPABASE — Load products from database
// ═══════════════════════════════════════════
function mapProduct(row) {
  return {
    id:   row.id,
    name: row.name,
    price:row.price,
    img:  row.image,
    cat:  row.category,
    tags: row.tags || [],
    desc: row.description || ''
  };
}

async function loadProductsFromSupabase() {
  if(SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
    console.log('ℹ️ Supabase not connected — using local products');
    return;
  }
  try {
    showLoadingSpinner(true);
    const rows = await sb.get('products');
    if(rows && rows.length > 0) {
      products = rows.map(mapProduct);
      console.log(`✅ Loaded ${products.length} products from Supabase`);
      renderGrid('homeGrid', products.slice(0,8));
      renderGrid('shopGrid', products);
      renderGrid('newGrid',  products);
    }
  } catch(err) {
    console.warn('⚠️ Supabase load failed, using local data:', err.message);
  } finally {
    showLoadingSpinner(false);
  }
}

async function saveOrderToSupabase(orderData) {
  if(SUPABASE_URL.includes('YOUR_PROJECT_ID')) return null;
  try {
    const result = await sb.post('orders', orderData);
    return result;
  } catch(err) {
    console.warn('⚠️ Order save failed:', err.message);
    return null;
  }
}

async function saveProductToSupabase(product) {
  if(SUPABASE_URL.includes('YOUR_PROJECT_ID')) return null;
  try {
    return await sb.post('products', {
      name:        product.name,
      price:       product.price,
      image:       product.img,
      category:    product.cat,
      tags:        product.tags,
      description: product.desc || ''
    });
  } catch(err) {
    console.warn('⚠️ Product save failed:', err.message);
    return null;
  }
}

function showLoadingSpinner(show) {
  let spinner = document.getElementById('sb-spinner');
  if(!spinner && show) {
    spinner = document.createElement('div');
    spinner.id = 'sb-spinner';
    spinner.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(245,240,232,.85);
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        z-index:99999;backdrop-filter:blur(4px);">
        <div style="width:40px;height:40px;border:2px solid rgba(14,13,12,.15);
          border-top-color:#c9783c;border-radius:50%;animation:spin .8s linear infinite;"></div>
        <p style="margin-top:18px;font-family:'Cormorant Garamond',serif;font-size:18px;
          color:#8a8178;letter-spacing:2px;">Loading...</p>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
    document.body.appendChild(spinner);
  }
  if(spinner) spinner.style.display = show ? 'block' : 'none';
}
