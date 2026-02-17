# 🔍 Cart & Checkout Debugging Guide

## Is Cart Using Backend? (Check These)

### ✅ Quick Verification Steps

1. **Open Browser Dev Tools** (F12)
2. **Go to Console Tab**
3. **Add a product to cart**
4. **Look for these console messages:**

#### If Backend is Working:
```
[Cart] Creating new backend cart for customer: undefined
[Cart] Create cart response: { success: true, data: { cart_id: "..." } }
[Cart] ✅ Backend cart created: e38d96ba-593e-497c-9bad-32ffc54228eb
[Cart] Adding item to backend cart: { cart_id: "...", variant_id: "...", quantity: 1 }
[Cart] Add item response: { success: true, ... }
[Cart] ✅ Item added to backend cart
```

#### If Backend is NOT Available:
```
[Cart] ⚠️ Using temporary cart_id (backend unavailable): temp-1234567890
[Cart] ❌ Backend add failed, using localStorage: Error: ...
```

### 🔍 Check Network Tab

1. **Open Network Tab** in Dev Tools
2. **Filter by "Fetch/XHR"**
3. **Add item to cart**
4. **You should see these requests:**

```
✅ POST /api/cart                    → Creates cart_id
✅ POST /api/cart/{cart_id}/items    → Adds item
✅ GET  /api/cart/{cart_id}          → Fetches updated cart
```

If you DON'T see these requests, the backend is not being called!

### 📦 Check localStorage

Open Console and run:
```javascript
// Check cart ID
localStorage.getItem('ksp_wines_cart_id')
// Should show: "e38d96ba-593e-497c-9bad-32ffc54228eb" (real cart)
// NOT: "temp-1234567890" (fallback)

// Check cart items
JSON.parse(localStorage.getItem('ksp_wines_cart'))
```

---

## Checkout Error (404) - What's Happening?

### The Problem

Your backend is returning **404 Not Found** for `/api/orders/direct`

### Possible Causes:

#### 1. Endpoint Not Implemented Yet
The `/api/orders/direct` endpoint might not exist on your backend.

**Check:** Does your backend code have this route?
```
POST /api/orders/direct
```

#### 2. Wrong Base URL
**Check your `.env.local` file:**
```env
NEXT_PUBLIC_API_URL=https://ecommerce-backend-h23p.onrender.com
```

Make sure there's NO `/api` at the end!
❌ Wrong: `https://ecommerce-backend-h23p.onrender.com/api`
✅ Right: `https://ecommerce-backend-h23p.onrender.com`

#### 3. Backend Not Deployed
If using Render.com, check:
- Is the backend service running?
- Did the latest deploy complete?
- Are there any build errors?

### 🔧 Solutions

#### Option A: Use Cart-Based Checkout (Recommended)

If `/api/orders/direct` doesn't exist, use cart-based checkout:
```
POST /api/orders/checkout
Body: {
  cart_id: "...",
  customer_id: "...",
  shipping_address_id: "...",
  payment_method: "cod"
}
```

**This requires:**
1. User must be logged in (to have customer_id)
2. Address must be saved first (to get address_id)

I've updated the code to try this first!

#### Option B: Deploy the Direct Checkout Endpoint

Add this route to your backend:
```javascript
// Backend: routes/orders.js
router.post('/direct', async (req, res) => {
  const { customer_id, items, shipping_address, payment_method } = req.body;
  // Create order with items directly
  // ...
});
```

---

## 🧪 Testing Flow

### Test 1: Login First (For Cart-Based Checkout)

1. Go to `/login`
2. Register or login
3. Add items to cart
4. Go to checkout
5. **Watch Console for:**
```
[Checkout] Starting order placement...
[Checkout] Cart ID: e38d96ba-593e-497c-9bad-32ffc54228eb
[Checkout] Customer ID: abc-123-customer-id
[Checkout] Attempting cart-based checkout...
[Checkout] ✅ Order created via cart checkout: ORDER-123
```

6. **Check Network Tab:**
```
POST /api/orders/checkout → 200 OK
Response: { success: true, data: { order_id: "..." } }
```

### Test 2: Without Login (Direct Checkout)

1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Add items to cart
4. Go to checkout as guest
5. **Watch Console for:**
```
[Checkout] Skipping cart-based checkout (no customer_id)
[Checkout] Attempting direct checkout...
[Checkout] Direct checkout payload: { ... }
```

6. **Check Network Tab:**
```
POST /api/orders/direct → Should be 200 OK
(Currently getting 404 - endpoint missing)
```

---

## 🐛 Current Status

Based on your screenshot:

❌ **Direct Checkout**: 404 Not Found
- Endpoint doesn't exist on backend yet

✅ **Cart API**: Should work (we're calling correct endpoints)
- POST /api/cart
- POST /api/cart/{cart_id}/items

⚠️ **Cart-Based Checkout**: Needs testing
- Requires login
- Will try this first now

---

## 📝 Action Items

### For You (Frontend User):

1. **Check if logged in:**
   - Open Console: `localStorage.getItem('ksp_wines_user')`
   - Should show user object with `id` field

2. **Test with login:**
   - Register/login first
   - Then try checkout
   - Should use cart-based checkout now

3. **Check backend logs:**
   - What does your backend show when checkout fails?
   - Any error messages?

### For Backend Developer:

1. **Implement `/api/orders/direct` endpoint** (if missing)
   - Accept: `{ items, shipping_address, payment_method, customer_id? }`
   - Return: `{ success: true, data: { order_id: "..." } }`

2. **Check `/api/orders/checkout` endpoint**
   - Does it work with cart_id?
   - What does it return?

3. **Enable CORS** for frontend domain
   ```javascript
   app.use(cors({
     origin: 'http://localhost:3000',
     credentials: true
   }));
   ```

---

## 🎯 Expected Console Output (Working State)

### Adding to Cart:
```
[Cart] Using existing cart_id: e38d96ba-593e-497c-9bad-32ffc54228eb
[Cart] Adding item to backend cart: {
  cart_id: "e38d96ba-593e-497c-9bad-32ffc54228eb",
  variant_id: "70ae2760-a061-4fbb-9cc6-95e1bc7ebd22",
  quantity: 1
}
[Cart] Add item response: { success: true, message: "Item added" }
[Cart] ✅ Item added to backend cart
```

### Placing Order:
```
[Checkout] Starting order placement...
[Checkout] Cart ID: e38d96ba-593e-497c-9bad-32ffc54228eb
[Checkout] Customer ID: customer-uuid-123
[Checkout] Items: 2
[Checkout] Attempting cart-based checkout...
[Checkout] Payload: {
  cart_id: "e38d96ba-593e-497c-9bad-32ffc54228eb",
  customer_id: "customer-uuid-123",
  payment_method: "cod"
}
[Checkout] Cart-based checkout response: {
  success: true,
  data: { order_id: "ORDER-UUID-456" }
}
[Checkout] ✅ Order created via cart checkout: ORDER-UUID-456
```

---

## 🔑 Key Points

1. **Cart IS calling backend** - I've verified the code does this
2. **Console logs will prove it** - Check for ✅ or ❌ messages
3. **404 error is for ORDER endpoint** - not cart
4. **Solution**: Either implement `/api/orders/direct` OR login and use cart checkout

Check the console now when you add to cart and place order!
