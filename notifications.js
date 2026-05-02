// ═══════════════════════════════════════════
// OTP VERIFICATION SYSTEM
// Supports: Mobile SMS (Fast2SMS) + Email OTP (EmailJS)
// ═══════════════════════════════════════════
let otpGenerated     = '';
let otpTimerInterval = null;
let otpVerified      = false;
let otpMethod        = 'mobile'; // 'mobile' or 'email'
let otpContact       = '';

function startCheckout() {
  if(cart.length === 0){ showToast('❌ Your cart is empty'); return; }
  if(otpVerified){ toggleCO(); return; }
  resetOTPModal();
  openModal('otp');
}

function resetOTPModal() {
  showOTPStep(1);
  otpMethod = 'mobile';
  document.getElementById('otpMobileTab').classList.add('active');
  document.getElementById('otpEmailTab').classList.remove('active');
  document.getElementById('otpMobileFields').style.display = 'block';
  document.getElementById('otpEmailFields').style.display  = 'none';
  document.getElementById('otpPhone').value = '';
  document.getElementById('otpEmailInput').value = '';
  document.getElementById('otpPhoneError').style.display = 'none';
  document.getElementById('otpEmailError').style.display  = 'none';
  clearOTPBoxes();
}

function switchOTPMethod(method) {
  otpMethod = method;
  document.getElementById('otpMobileTab').classList.toggle('active', method==='mobile');
  document.getElementById('otpEmailTab').classList.toggle('active',  method==='email');
  document.getElementById('otpMobileFields').style.display = method==='mobile' ? 'block':'none';
  document.getElementById('otpEmailFields').style.display  = method==='email'  ? 'block':'none';
}

function showOTPStep(step) {
  document.getElementById('otpStep1').style.display = step===1 ? 'block':'none';
  document.getElementById('otpStep2').style.display = step===2 ? 'block':'none';
  document.getElementById('otpStep3').style.display = step===3 ? 'block':'none';
}

function otpBoxInput(el, index) {
  el.value = el.value.replace(/\D/g,'');
  el.classList.toggle('filled', el.value !== '');
  if(el.value && index < 5) document.querySelectorAll('.otp-box')[index+1].focus();
  if(getOTPBoxValue().length === 6) verifyOTP();
}

function otpBoxKey(el, index, e) {
  if(e.key==='Backspace' && !el.value && index > 0)
    document.querySelectorAll('.otp-box')[index-1].focus();
}

function getOTPBoxValue() {
  return Array.from(document.querySelectorAll('.otp-box')).map(b=>b.value).join('');
}

function clearOTPBoxes() {
  document.querySelectorAll('.otp-box').forEach(b=>{
    b.value=''; b.classList.remove('filled'); b.style.borderColor='';
  });
}

async function sendOTP() {
  otpGenerated = Math.floor(100000 + Math.random()*900000).toString();

  if(otpMethod === 'mobile') {
    const phone = document.getElementById('otpPhone').value.trim();
    const code  = document.getElementById('otpCountryCode').value;
    const errEl = document.getElementById('otpPhoneError');
    if(phone.replace(/\D/g,'').length < 10){ errEl.style.display='block'; return; }
    errEl.style.display = 'none';
    otpContact = code+' '+phone;
    showToast('Sending OTP...');
    const sent = await sendSMSOTP(code+phone.replace(/\D/g,''), otpGenerated);
    if(sent || FAST2SMS_API_KEY.includes('YOUR_FAST2SMS_KEY')) {
      if(FAST2SMS_API_KEY.includes('YOUR_FAST2SMS_KEY')) {
        console.log('🔐 TEST OTP (mobile):', otpGenerated);
        showToast('📱 Test OTP: '+otpGenerated+' — check console');
      } else {
        showToast('✓ OTP sent to '+otpContact);
      }
      document.getElementById('otpSentMsg').textContent = 'OTP sent to '+otpContact;
      goToOTPStep2();
    } else {
      showToast('❌ SMS failed. Try Email OTP instead.');
    }

  } else {
    const email = document.getElementById('otpEmailInput').value.trim();
    const errEl = document.getElementById('otpEmailError');
    if(!email || !email.includes('@')){ errEl.style.display='block'; return; }
    errEl.style.display = 'none';
    otpContact = email;
    showToast('Sending OTP to email...');
    const sent = await sendEmailOTP(email, otpGenerated);
    if(sent || EMAILJS_SERVICE_ID.includes('YOUR_SERVICE_ID')) {
      if(EMAILJS_SERVICE_ID.includes('YOUR_SERVICE_ID')) {
        console.log('🔐 TEST OTP (email):', otpGenerated);
        showToast('📧 Test OTP: '+otpGenerated+' — check console');
      } else {
        showToast('✓ OTP sent to '+email);
      }
      document.getElementById('otpSentMsg').textContent = 'OTP sent to '+email;
      goToOTPStep2();
    } else {
      showToast('❌ Email OTP failed. Try mobile instead.');
    }
  }
}

function goToOTPStep2() {
  showOTPStep(2);
  clearOTPBoxes();
  document.getElementById('otpError').style.display = 'none';
  const timerEl = document.getElementById('otpTimer');
  if(timerEl) timerEl.style.color = 'var(--accent)';
  startOTPTimer(60);
  setTimeout(()=>document.querySelectorAll('.otp-box')[0].focus(), 100);
}

async function sendSMSOTP(fullPhone, otp) {
  if(FAST2SMS_API_KEY.includes('YOUR_FAST2SMS_KEY')) return false;
  try {
    const res = await fetch(
      `https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_API_KEY}&variables_values=${otp}&route=otp&numbers=${fullPhone.replace(/\+91/,'')}`,
      {method:'GET', headers:{'cache-control':'no-cache'}}
    );
    const data = await res.json();
    return data.return === true;
  } catch(e){ console.warn('SMS OTP error:',e); return false; }
}

async function sendEmailOTP(email, otp) {
  if (EMAILJS_SERVICE_ID.includes('YOUR_SERVICE_ID')) return false;
  if (typeof emailjs === 'undefined') return false;

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_OTP, {
      email: email,
      passcode: otp,
      time: '10 minutes'
    });

    return true;
  } catch (e) {
    console.warn('Email OTP error:', e);
    return false;
  }
}

function startOTPTimer(seconds) {
  clearInterval(otpTimerInterval);
  let rem = seconds;
  const timerEl = document.getElementById('otpTimer');
  if(!timerEl) return;
  timerEl.textContent = rem+'s';
  otpTimerInterval = setInterval(()=>{
    rem--;
    timerEl.textContent = rem+'s';
    if(rem <= 0){
      clearInterval(otpTimerInterval);
      timerEl.textContent = 'Expired';
      timerEl.style.color = '#c0392b';
    }
  }, 1000);
}

function verifyOTP() {
  const entered = getOTPBoxValue();
  if(entered.length < 6){ showToast('❌ Enter all 6 digits'); return; }
  if(entered === otpGenerated) {
    clearInterval(otpTimerInterval);
    document.getElementById('otpError').style.display = 'none';
    showOTPStep(3);
    otpVerified = true;
    showToast('✅ Verified! Opening checkout...');
    setTimeout(()=>{ closeModal('otp'); toggleCO(); }, 1500);
  } else {
    document.getElementById('otpError').style.display = 'block';
    document.querySelectorAll('.otp-box').forEach(b=>{
      b.style.borderColor='#c0392b';
      b.style.animation='shake .3s ease';
      setTimeout(()=>{ b.style.borderColor=''; b.style.animation=''; }, 400);
    });
    clearOTPBoxes();
    setTimeout(()=>document.querySelectorAll('.otp-box')[0].focus(), 100);
  }
}

async function resendOTP() {
  const timerEl = document.getElementById('otpTimer');
  if(timerEl && timerEl.textContent!=='Expired' && timerEl.textContent!=='0s'){
    showToast('⚠️ Wait for timer to expire'); return;
  }
  otpGenerated = Math.floor(100000 + Math.random()*900000).toString();
  if(otpMethod==='mobile') {
    const phone = document.getElementById('otpPhone').value.trim();
    const code  = document.getElementById('otpCountryCode').value;
    await sendSMSOTP(code+phone.replace(/\D/g,''), otpGenerated);
  } else {
    const email = document.getElementById('otpEmailInput').value.trim();
    await sendEmailOTP(email, otpGenerated);
  }
  console.log('🔐 Resent OTP:', otpGenerated);
  showToast('✓ OTP resent to '+otpContact);
  clearOTPBoxes();
  if(timerEl) timerEl.style.color='var(--accent)';
  startOTPTimer(60);
  setTimeout(()=>document.querySelectorAll('.otp-box')[0].focus(), 100);
}

// ═══════════════════════════════════════════
// EMAIL NOTIFICATIONS — Order Confirmation
// ═══════════════════════════════════════════
function initEmailJS() {
  if(!EMAILJS_PUBLIC_KEY.includes('YOUR_PUBLIC_KEY') && typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('✅ EmailJS initialized');
  }
}

async function sendOrderConfirmationEmail(orderData) {
  if(EMAILJS_SERVICE_ID.includes('YOUR_SERVICE_ID')) {
    console.log('📧 [TEST] Email would go to:', orderData.user_email); return;
  }
  if(typeof emailjs === 'undefined'){ console.warn('EmailJS not loaded'); return; }
  const itemsList = orderData.items.map(i=>
    `${i.qty}x ${i.name} (${i.size||'S'}) — ₹${(i.price*i.qty).toFixed(2)}`
  ).join('\n');
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ORDER, {
      to_email:       orderData.user_email,
      to_name:        orderData.shipping_address?.name||'Customer',
      order_id:       String(orderData.order_id||'N/A'),
      order_items:    itemsList,
      order_total:    '₹'+Number(orderData.total).toFixed(2),
      payment_method: orderData.payment_method,
      order_status:   orderData.payment_method==='COD'?'Confirmed — Pay on Delivery':'✅ Payment Received',
      shipping_addr:  orderData.shipping_address
        ? `${orderData.shipping_address.address}, ${orderData.shipping_address.city}, ${orderData.shipping_address.postal}, ${orderData.shipping_address.country}`
        : 'N/A',
      payment_id:     orderData.payment_id||'N/A',
      shop_name:      'RANGLOOP',
      shop_email:     'hello@rangloop.com',
    });
    console.log('📧 Order email sent to:', orderData.user_email);
  } catch(err){ console.warn('📧 Email failed:',err); }
}

// ═══════════════════════════════════════════
// SMS ORDER NOTIFICATION — Fast2SMS
// ═══════════════════════════════════════════
async function sendOrderSMSNotification(orderData) {
  if(FAST2SMS_API_KEY.includes('YOUR_FAST2SMS_KEY')) {
    console.log('📱 [TEST] SMS would go to:', orderData.shipping_address?.phone); return;
  }
  const rawPhone = (orderData.shipping_address?.phone||'').replace(/\D/g,'');
  const phone = rawPhone.slice(-10);
  if(phone.length < 10) return;
  const msg = `RANGLOOP: Hi ${orderData.shipping_address?.name||''}! Order #${orderData.order_id} of ₹${Number(orderData.total).toFixed(2)} via ${orderData.payment_method} confirmed. Delivery in 5-7 days. Thank you!`;
  try {
    await fetch(
      `https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_API_KEY}&sender_id=FSTSMS&message=${encodeURIComponent(msg)}&language=english&route=p&numbers=${phone}`,
      {method:'GET', headers:{'cache-control':'no-cache'}}
    );
    console.log('📱 Order SMS sent to:', phone);
  } catch(e){ console.warn('SMS failed:',e); }
}
