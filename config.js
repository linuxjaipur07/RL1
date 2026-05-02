// ⚠️  STEP 1: PASTE YOUR SUPABASE CREDENTIALS HERE
const SUPABASE_URL = 'https://pkjojisbdcqwydxuncnr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBram9qaXNiZGNxd3lkeHVuY25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxOTc0NjYsImV4cCI6MjA5Mjc3MzQ2Nn0.M67tsbhus4Ud9HfCUfizkcGBrpS8MzxXAcrEOmm-9og';

// ⚠️  STEP 2: PASTE YOUR RAZORPAY KEY HERE
// Get it from: razorpay.com → Settings → API Keys → Key ID
const RAZORPAY_KEY = 'rzp_test_YOUR_KEY_HERE'; // Replace with rzp_live_... for production

// ⚠️  STEP 3: EMAILJS CONFIG (free at emailjs.com)
// Setup: emailjs.com → Add Service (Gmail) → Add Template → Copy IDs
const EMAILJS_SERVICE_ID  = 'service_xuis7tm';   // e.g. service_abc123
const EMAILJS_TEMPLATE_OTP = 'template_r5oydik';  // e.g. template_xyz789
const EMAILJS_TEMPLATE_ORDER = 'template_wbd0buw'; // e.g. template_xyz789
const EMAILJS_PUBLIC_KEY  = 'clpa3O6vvYqRSGyKm';   // e.g. user_XXXXXXXXXX

emailjs.init(EMAILJS_PUBLIC_KEY);

// ⚠️  STEP 4: TWILIO CONFIG (free trial at twilio.com)
// For OTP SMS — needs a small backend (Netlify/Vercel function)
// OR use Fast2SMS (Indian service, easier): fast2sms.com
const FAST2SMS_API_KEY = '5NVyiEg0Yn36HAfperzChBoJaOmKxLdRj4v7FMwIcb29ZWTPUlvRHBD21F4J6N8lUPYfOGwguSxEpCqA';    // fast2sms.com → API → Dev API Key
