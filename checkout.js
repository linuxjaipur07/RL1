// ═══════════════════════════════════════════
// CHECKOUT — Complete with Razorpay + COD + UPI
// ═══════════════════════════════════════════
let checkoutData = {shipping:null, payment:null};

function toggleCO(){
  const wrap = document.getElementById('coWrap');
  const isShowing = wrap.classList.contains('show');
  wrap.classList.toggle('show');
  if(!isShowing) {
    // Reset to step 1 every time checkout opens
    document.querySelectorAll('.co-tab').forEach((t,i)=>t.classList.toggle('active',i===0));
    document.querySelectorAll('.co-form').forEach((f,i)=>f.classList.toggle('active',i===0));
  }
}

function switchCO(tab, el) {
  document.querySelectorAll('.co-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.co-form').forEach(f=>f.classList.remove('active'));
  el.classList.add('active');
  const m = {shipping:'coShipping', payment:'coPayment', review:'coReview'};
  if(m[tab]) document.getElementById(m[tab]).classList.add('active');
  if(tab==='review') buildReview();
}

// ── STEP 1: Shipping ──────────────────────────────────────────────────────
function validateShipping() {
  const g = id => document.getElementById(id).value.trim();
  const name    = g('coName'),
        email   = g('coEmail'),
        phone   = g('coPhone'),
        address = g('coAddress'),
        city    = g('coCity'),
        postal  = g('coPostal'),
        country = document.getElementById('coCountry').value;

  if(!name||!email||!phone||!address||!city||!postal||!country){
    showToast('❌ Please fill all shipping fields'); return;
  }
  if(!email.includes('@')||!email.includes('.')){
    showToast('❌ Invalid email address'); return;
  }
  if(phone.replace(/\D/g,'').length < 10){
    showToast('❌ Invalid phone number (min 10 digits)'); return;
  }

  checkoutData.shipping = {name,email,phone,address,city,postal,country};
  showToast('✓ Shipping details saved');
  switchCO('payment', document.querySelectorAll('.co-tab')[1]);
}

// ── STEP 2: Payment Method ────────────────────────────────────────────────
function selectPaymentMethod(el, method) {
  document.querySelectorAll('.pay-opt').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  checkoutData.payment = method;

  // Show/hide relevant fields
  const show = id => { const e=document.getElementById(id); if(e) e.style.display='block'; };
  const hide = id => { const e=document.getElementById(id); if(e) e.style.display='none';  };
  ['razorpayInfo','upiFields','codNote'].forEach(hide);
  if(method==='Razorpay') show('razorpayInfo');
  if(method==='UPI')      show('upiFields');
  if(method==='COD') {
    show('codNote');
    const t = cart.reduce((s,i)=>s+(i.price*i.qty),0);
    const el = document.getElementById('codTotal');
    if(el) el.textContent = '₹'+t.toFixed(2);
  }

  // Update confirm button text
  const btn = document.getElementById('confirmBtn');
  if(btn) {
    const labels = {
      Razorpay: '🔒 Pay Now via Razorpay',
      UPI:      '🔵 Pay via UPI',
      COD:      '🚚 Place COD Order'
    };
    btn.textContent   = labels[method] || 'Place Order';
    btn.style.background = method==='COD' ? 'var(--ink)' :
                           method==='UPI' ? '#1a237e'    : '#2d6a4f';
  }
}

function validatePayment() {
  if(!checkoutData.payment){ showToast('❌ Please select a payment method'); return; }

  if(checkoutData.payment === 'UPI') {
    const upiId = document.getElementById('coUPIID').value.trim();
    if(!upiId||!upiId.includes('@')||upiId.split('@').length!==2){
      showToast('❌ Invalid UPI ID — use format: name@bank'); return;
    }
    const [u,b] = upiId.split('@');
    if(u.length<3||b.length<3){ showToast('❌ UPI ID too short'); return; }
  }

  if(!checkoutData.shipping){ showToast('❌ Please complete shipping first'); return; }

  showToast('✓ Payment method confirmed');
  switchCO('review', document.querySelectorAll('.co-tab')[2]);
}

// ── STEP 3: Review ────────────────────────────────────────────────────────
function buildReview() {
  const {shipping, payment} = checkoutData;
  if(!shipping || !payment) return;

  // Shipping address
  document.getElementById('reviewAddress').innerHTML =
    `<strong>${shipping.name}</strong><br>
     ${shipping.address}<br>
     ${shipping.city}, ${shipping.postal}<br>
     ${shipping.country}<br>
     <small style="color:var(--muted)">📧 ${shipping.email} &nbsp;|&nbsp; 📱 ${shipping.phone}</small>`;

  // Items list
  document.getElementById('reviewItems').innerHTML =
    cart.map(i=>`
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(14,13,12,.07);">
        <span>${i.qty}× ${i.name} <small style="color:var(--muted)">(${i.size||'S'})</small></span>
        <strong>₹${(i.price*i.qty).toFixed(2)}</strong>
      </div>`).join('');

  // Payment method
  const pm = {
    Razorpay: '💳 Card / UPI / Wallet via Razorpay',
    UPI:      '🔵 UPI Direct — '+document.getElementById('coUPIID').value,
    COD:      '🚚 Cash on Delivery'
  }[payment];
  document.getElementById('reviewPayment').innerHTML = pm||payment;

  // Total
  const total = cart.reduce((s,i)=>s+(i.price*i.qty),0);
  document.getElementById('reviewTotal').textContent = '₹'+total.toFixed(2);
}

// ── STEP 4: Confirm Order ─────────────────────────────────────────────────
async function confirmOrder() {
  // Validations
  if(!document.getElementById('coTerms').checked){
    showToast('❌ Please accept Terms & Conditions'); return;
  }
  if(!checkoutData.shipping){
    showToast('❌ Shipping details missing'); return;
  }
  if(!checkoutData.payment){
    showToast('❌ Payment method not selected'); return;
  }
  if(cart.length === 0){
    showToast('❌ Your cart is empty'); return;
  }

  // Route to correct payment handler
  if(checkoutData.payment === 'COD') {
    await processCODOrder();
  } else if(checkoutData.payment === 'UPI') {
    openRazorpay('upi');
  } else if(checkoutData.payment === 'Razorpay') {
    openRazorpay('all');
  } else {
    showToast('❌ Unknown payment method'); return;
  }
}

// ── RAZORPAY ──────────────────────────────────────────────────────────────
function openRazorpay(mode) {
  if(RAZORPAY_KEY.includes('YOUR_KEY_HERE')){
    showToast('⚠️ Add your Razorpay Key in config.js');
    return;
  }
  const total    = cart.reduce((s,i)=>s+(i.price*i.qty),0);
  const paise    = Math.round(total * 100);
  const {shipping} = checkoutData;

  const options = {
    key:         RAZORPAY_KEY,
    amount:      paise,
    currency:    'INR',
    name:        'RANGLOOP',
    description: `Order — ${cart.length} item(s)`,
    image:       'assets/logo.png',
    prefill:     {name:shipping.name, email:shipping.email, contact:shipping.phone},
    theme:       {color:'#c9783c'},
    config: mode==='upi' ? {
      display:{
        blocks:{upi:{name:'Pay via UPI',instruments:[{method:'upi'}]}},
        sequence:['block.upi'],
        preferences:{show_default_blocks:false}
      }
    } : {},

    // ✅ Called ONLY when payment is successful
    handler: async function(response) {
      const pid = response.razorpay_payment_id;
      showToast('✅ Payment received! Confirming order...');

      const orderPayload = {
        user_email:       shipping.email,
        items:            cart.map(i=>({id:i.id,name:i.name,price:i.price,qty:i.qty,size:i.size||'S'})),
        total:            total,
        shipping_address: shipping,
        payment_method:   checkoutData.payment,
        payment_id:       pid,
        status:           'paid'
      };

      const saved = await saveOrderToSupabase(orderPayload);
      const oid   = saved && saved[0] ? saved[0].id : 'RL'+Date.now();

      finishOrder(oid, shipping.email, total, checkoutData.payment, pid);
    },

    // ❌ Payment cancelled
    modal:{
      ondismiss: ()=> showToast('⚠️ Payment cancelled — cart is still saved.')
    }
  };

  const rzp = new Razorpay(options);

  // ❌ Payment failed
  rzp.on('payment.failed', r=>{
    showToast('❌ Payment failed: ' + r.error.description);
    console.error('Razorpay payment failed:', r.error);
  });

  rzp.open();
}

// ── COD Order ─────────────────────────────────────────────────────────────
async function processCODOrder() {
  showToast('Placing COD order...');
  const total = cart.reduce((s,i)=>s+(i.price*i.qty),0);

  const orderPayload = {
    user_email:       checkoutData.shipping.email,
    items:            cart.map(i=>({id:i.id,name:i.name,price:i.price,qty:i.qty,size:i.size||'S'})),
    total:            total,
    shipping_address: checkoutData.shipping,
    payment_method:   'COD',
    payment_id:       null,
    status:           'confirmed'
  };

  const saved = await saveOrderToSupabase(orderPayload);
  const oid   = saved && saved[0] ? saved[0].id : 'RL'+Date.now();

  finishOrder(oid, checkoutData.shipping.email, total, 'COD', null);
}

// ── Finish Order — send notifications + show confirmation ─────────────────
async function finishOrder(orderId, email, total, method, paymentId) {
  // Snapshot cart before clearing
  const orderItems = cart.map(i=>({id:i.id,name:i.name,price:i.price,qty:i.qty,size:i.size||'S'}));
  const shipping   = checkoutData.shipping || {};

  // Prepare notification payload
  const notifData = {
    order_id:         orderId,
    user_email:       email,
    items:            orderItems,
    total:            total,
    payment_method:   method,
    payment_id:       paymentId,
    shipping_address: shipping
  };

  // Clear cart + reset OTP
  cart           = [];
  checkoutData   = {shipping:null, payment:null};
  otpVerified    = false;
  updateCart();

  // Show confirmation modal immediately
  showOrderConfirmation(orderId, email, total, method, paymentId);

  // Send email + SMS in background
  sendOrderConfirmationEmail(notifData);
  sendOrderSMSNotification(notifData);

  // Close drawer + reset form after delay
  setTimeout(()=>{
    closeDrawer('cart');
    document.getElementById('coWrap').classList.remove('show');
    resetCheckoutForm();
  }, 3500);
}

// ── Order Confirmation Modal ──────────────────────────────────────────────
function showOrderConfirmation(orderId, email, total, method, paymentId) {
  // Remove any existing modal
  const existing = document.getElementById('orderConfirmModal');
  if(existing) existing.remove();

  const emap    = {Razorpay:'💳', UPI:'🔵', COD:'🚚'};
  const emoji   = emap[method]||'✅';
  const isPaid  = method !== 'COD';
  const stColor = isPaid ? '#2d6a4f' : '#c9783c';
  const stLabel = isPaid ? '✅ Payment Received' : '🕐 Pay on Delivery';

  const modal = document.createElement('div');
  modal.id = 'orderConfirmModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(14,13,12,.9);backdrop-filter:blur(8px);display:flex;justify-content:center;align-items:center;z-index:10000;padding:20px;';

  modal.innerHTML = `
    <div style="background:var(--cream);border-radius:8px;padding:36px;max-width:500px;width:100%;
      text-align:center;box-shadow:0 24px 64px rgba(0,0,0,.4);
      animation:slideUp .4s ease;max-height:90vh;overflow-y:auto;">

      <div style="width:70px;height:70px;background:${stColor};border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        font-size:30px;margin:0 auto 18px;animation:popIn .5s ease;">✅</div>

      <h2 style="font-family:var(--fd);font-size:36px;font-weight:300;margin-bottom:6px;">
        Order Confirmed!
      </h2>
      <p style="font-size:13px;color:var(--muted);margin-bottom:24px;">
        Thank you for shopping with RANGLOOP 🎉
      </p>

      <div style="background:var(--warm);padding:20px;border-radius:6px;
        margin-bottom:18px;text-align:left;font-size:13px;line-height:2.1;">
        <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(14,13,12,.08);padding-bottom:8px;margin-bottom:8px;">
          <span style="color:var(--muted);">Order ID</span>
          <strong style="font-family:monospace;color:var(--accent);">#${orderId}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:var(--muted);">Email</span>
          <span style="font-size:11px;max-width:60%;text-align:right;word-break:break-all;">${email}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:var(--muted);">Amount</span>
          <strong style="color:var(--accent);font-size:16px;">₹${Number(total).toFixed(2)}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:var(--muted);">Payment</span>
          <strong>${emoji} ${method}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;border-top:1px solid rgba(14,13,12,.08);padding-top:8px;margin-top:8px;">
          <span style="color:var(--muted);">Status</span>
          <strong style="color:${stColor};">${stLabel}</strong>
        </div>
        ${paymentId ? `
        <div style="border-top:1px solid rgba(14,13,12,.08);padding-top:8px;margin-top:8px;">
          <span style="color:var(--muted);font-size:11px;display:block;margin-bottom:4px;">Transaction ID</span>
          <code style="font-family:monospace;font-size:10px;word-break:break-all;color:var(--ink);">${paymentId}</code>
        </div>` : ''}
      </div>

      <div style="background:rgba(201,120,60,.08);padding:14px;border-radius:6px;
        margin-bottom:20px;font-size:12px;line-height:1.9;color:var(--muted);text-align:left;">
        <p>📧 Confirmation email sent to <strong style="color:var(--ink);">${email}</strong></p>
        <p>📱 SMS sent to your registered mobile number</p>
        <p>🚚 Delivery expected in <strong style="color:var(--ink);">5–7 business days</strong></p>
      </div>

      <button onclick="closeOrderConfirmation()"
        style="width:100%;padding:14px;background:var(--ink);color:var(--cream);border:none;
        border-radius:4px;font-family:var(--fb);font-size:11px;letter-spacing:2px;
        text-transform:uppercase;cursor:pointer;transition:background .2s;"
        onmouseover="this.style.background='var(--accent)'"
        onmouseout="this.style.background='var(--ink)'">
        Continue Shopping
      </button>
    </div>

    <style>
      @keyframes slideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
      @keyframes popIn{0%{transform:scale(0)}70%{transform:scale(1.15)}100%{transform:scale(1)}}
    </style>`;

  document.body.appendChild(modal);
}

function closeOrderConfirmation() {
  const m = document.getElementById('orderConfirmModal');
  if(m) m.remove();
  showPage('home');
}

// ── Reset Checkout Form ───────────────────────────────────────────────────
function resetCheckoutForm() {
  ['coName','coEmail','coPhone','coAddress','coCity','coPostal','coCountry','coUPIID']
    .forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });

  const terms = document.getElementById('coTerms');
  if(terms) terms.checked = false;

  document.querySelectorAll('.co-tab').forEach((t,i)=>t.classList.toggle('active',i===0));
  document.querySelectorAll('.co-form').forEach((f,i)=>f.classList.toggle('active',i===0));
  document.querySelectorAll('.pay-opt').forEach((p,i)=>p.classList.toggle('active',i===0));

  const btn = document.getElementById('confirmBtn');
  if(btn){ btn.textContent='Confirm & Place Order'; btn.style.background=''; }

  ['razorpayInfo','upiFields','codNote'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.style.display = id==='razorpayInfo' ? 'block' : 'none';
  });

  clearOTPBoxes();
  showOTPStep(1);
  const otpPhoneEl = document.getElementById('otpPhone');
  if(otpPhoneEl) otpPhoneEl.value = '';
  const otpEmailEl = document.getElementById('otpEmailInput');
  if(otpEmailEl) otpEmailEl.value = '';
  clearInterval(otpTimerInterval);
  checkoutData = {shipping:null, payment:null};
}

// ── Legacy ────────────────────────────────────────────────────────────────
function selPay(el){document.querySelectorAll('.pay-opt').forEach(m=>m.classList.remove('active'));el.classList.add('active');}
function placeOrder(){confirmOrder();}
