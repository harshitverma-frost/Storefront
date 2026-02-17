# 🧪 Quick Testing Checklist

## ✅ What Was Fixed

1. **Cart API endpoints** - Now correctly formatted (`/api/cart/{cart_id}/items`)
2. **Backend integration** - Cart syncs with backend database
3. **Order creation** - Orders properly sent to backend
4. **variant_id tracking** - Required field now included
5. **Async operations** - All cart operations properly handle API calls

## 🚀 Quick Test (5 minutes)

### Step 1: Add to Cart
1. Open http://localhost:3000
2. Go to any product page
3. Click "Add to Cart"
4. ✅ Check: Toast notification appears
5. ✅ Check: Browser console shows `/api/cart` calls
6. ✅ Check: localStorage has `ksp_wines_cart_id`

### Step 2: View Cart
1. Click cart icon (or go to `/cart`)
2. ✅ Check: Items appear
3. ✅ Check: Quantities are correct
4. ✅ Check: Price calculations are correct

### Step 3: Update Cart
1. Click + or - on quantity
2. ✅ Check: Network tab shows PATCH request
3. ✅ Check: Quantity updates immediately
4. Click X to remove item
5. ✅ Check: Item is removed

### Step 4: Complete Order (Most Important!)
1. Add items to cart
2. Go to checkout
3. Fill in address form
4. Click "Place Order"
5. ✅ Check: Network tab shows `POST /api/orders/direct`
6. ✅ Check: Response has `order_id`
7. ✅ Check: Success message appears
8. ✅ Check: Redirected to confirmation page
9. **✅ CHECK ADMIN PANEL: Order should appear!**

## 🔍 Debugging

### If cart items don't appear:
```bash
# Open browser console and check:
localStorage.getItem('ksp_wines_cart_id')
localStorage.getItem('ksp_wines_cart')
```

### If orders don't appear in admin:
1. Check Network tab for `/api/orders/direct` response
2. Look for `order_id` in response
3. Check response status code (should be 200)
4. Verify `NEXT_PUBLIC_API_URL` matches backend

### Backend Connection
Current backend URL should be in `.env.local`:
```
NEXT_PUBLIC_API_URL=your-backend-url
```

## 📊 Expected Network Calls

When adding to cart:
```
POST /api/cart (if first item)
POST /api/cart/{cart_id}/items
GET /api/cart/{cart_id}
```

When checking out:
```
POST /api/orders/direct
  Body: {
    customer_id, items, shipping_address, payment_method
  }
  Response: {
    success: true,
    data: { order_id: "..." }
  }
```

## ✨ Key IDs for Testing

You provided these IDs - they should work with your backend:
- Cart ID: `e38d96ba-593e-497c-9bad-32ffc54228eb`
- Product ID: `7de4694f-9eec-41a2-be2f-60ea6bd8514d`
- Variant ID: `70ae2760-a061-4fbb-9cc6-95e1bc7ebd22`

## 🎯 Success = Orders in Admin Panel

The ultimate test: After completing Step 4 above, log into your admin panel and verify the order appears with:
- Order ID
- Customer info
- Items list
- Total amount
- Shipping address

If this works, everything is fixed! 🎉
