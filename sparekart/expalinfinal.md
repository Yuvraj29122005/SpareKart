# Sparekart — Complete Technical Documentation & Q&A

This document provides a comprehensive technical breakdown of the Sparekart E-Commerce website. It covers the **User Panel**, **Admin Panel**, **Database Operations**, **Session Management**, **User Data Isolation**, **Caching**, and answers every important technical question about the platform.

---

## 1. Core Technical Architecture Questions & Answers

### Q1. What type of database is used?
**Answer:** The website uses **MongoDB**, a high-performance **NoSQL (Not Only SQL) Document Database**. Instead of storing data in rigid tables and rows like a traditional relational database (e.g., MySQL), MongoDB stores data in flexible, JSON-like documents called BSON. This is ideal for e-commerce platforms like Sparekart because product attributes (like car parts with varying specifications) can have flexible structures. The database is hosted on the cloud using **MongoDB Atlas**.

### Q2. What type of database coding is used?
**Answer:** The backend uses **Mongoose ODM (Object Data Modeling)** to interact with the MongoDB database.
- Mongoose allows us to define strict structural **schemas** for our NoSQL data (e.g., ensuring every `User` has an `email` and `password`, or an `Order` has a `shippingAddress`).
- The coding paradigm is **asynchronous JavaScript** using **Promises** and **`async/await`**.
- We use operations like `Model.findOne({ email })`, `Model.create()`, `Model.findById()`, and `Model.deleteMany()` to perform **CRUD (Create, Read, Update, Delete)** operations without writing raw SQL queries.
- We also use high-performance **MongoDB Aggregation Pipelines** (with `$group`, `$sum`, `$cond`) for the admin dashboard analytics to compute metrics (total revenue, paid/pending order counts) directly on the database server.

### Q3. How do you connect the frontend and the backend?
**Answer:** The connection between the Frontend (React.js) and Backend (Node.js/Express) is achieved using a **RESTful API Architecture**:
1. **HTTP Requests (Fetch API):** The React frontend sends HTTP requests (GET, POST, PUT, DELETE, PATCH) to the Express backend endpoints (e.g., `http://localhost:5000/api/users/login`).
2. **CORS:** The backend uses a middleware called `cors` (Cross-Origin Resource Sharing) configured to accept requests from the frontend port (e.g., `localhost:5173` → `localhost:5000`).
3. **JSON Payloads:** All data passed back and forth (like login credentials, product details, or order data) is serialized and parsed as **JSON** format using `Content-Type: application/json`.
4. **Centralized API Module (`api.js`):** The frontend has a single `apiFetch()` helper function in `src/data/api.js` that wraps JavaScript's native `fetch()`. Every component calls this function instead of using `fetch` directly. This centralized module automatically attaches the JWT token to every request's `Authorization` header, handles errors uniformly, and manages caching.
5. **JWT Authentication:** The backend generates a **JSON Web Token (JWT)** upon login. The frontend caches this token in `localStorage` and sends it in the `Authorization: Bearer <token>` header on all subsequent API requests to prove the user's identity.

### Q4. How does the Email OTP sending work?
**Answer:** The OTP feature is fully custom and handles two scenarios: **Registration** and **Forgot Password**.
1. **Generation:** When a user requests an OTP, the Node.js backend generates a random 6-digit numeric string using `Math.floor(100000 + Math.random() * 900000).toString()`.
2. **Database Storage:** The OTP is saved in an `Otp` MongoDB collection along with the user's email and registration data (name, hashed password, phone).
3. **Nodemailer Integration:** The backend uses `nodemailer` with SMTP (Simple Mail Transfer Protocol). It connects to Gmail's SMTP server using App Passwords stored in the `.env` file.
4. **Delivery:** The backend dispatches an HTML email containing the 6-digit OTP asynchronously to the user's email address.
5. **Verification:** When the user submits the OTP on the frontend, the backend queries the `Otp` collection with `Otp.findOne({ email, otp })`. If it matches, the user account is created (registration) or the password is reset (forgot password).
6. **Cleanup:** After successful verification, all OTP records for that email are permanently deleted with `Otp.deleteMany({ email })`.

### Q5. How does the PDF bill/invoice downloading feature work?
**Answer:** The PDF generation happens entirely on the **Client-Side (Frontend)**, putting zero load on the server.
1. **Libraries:** We use `jspdf` (to create the PDF document object) and `jspdf-autotable` (to draw formatted product tables inside the PDF).
2. **Data Assembly:** When a user clicks "Download PDF Bill" in the `Orders.jsx` page, the component uses the `selectedOrder` state (which contains product names, prices, quantities) and also fetches the user's name via `apiFetch("/users/me")`.
3. **Drawing Process:** A `new jsPDF()` instance is created. Using methods like `doc.text()` and `doc.addImage()`, the script manually positions the SpareKart logo, customer name, order ID, date, payment status, and shipping address.
4. **Auto Table:** The `jspdf-autotable` plugin maps the products array into structured rows with columns: Product Name, Unit Price, Qty, and Total.
5. **Browser Download:** Finally, `doc.save('SpareKart_Bill_<orderID>.pdf')` triggers the browser to compile the canvas into a `.pdf` file and download it instantly to the user's local machine.

---

## 2. User Panel (`src/user/`) — Deep Technical Q&A

### Q6. What is the User Panel and what pages does it contain?
**Answer:** The User Panel is the **customer-facing** side of Sparekart. It is located in `src/user/` and contains:

| Page File | Route | Purpose |
|-----------|-------|---------|
| `Home.jsx` | `/home` | Landing page with hero banner and 6 featured products from the database |
| `Products.jsx` | `/products` | Full product catalogue with search & category filters |
| `ProductDetails.jsx` | `/product/:id` | Single product detail page with "Add to Cart" and "Buy Now" |
| `Cart.jsx` | `/cart` | Shopping cart with quantity controls and remove functionality |
| `Checkout.jsx` | `/checkout` | Order form with contact info, shipping address, and payment method selection |
| `Orders.jsx` | `/orders` | User's order history list + order detail view + PDF bill download |
| `OrderDetails.jsx` | `/order/:id` | Individual order detail page |
| `Profile.jsx` | `/profile` | User profile view and edit (name, phone, avatar) |
| `Feedback.jsx` | `/feedback` | Feedback/review submission form |

### Q7. How does the User Panel fetch data from the database?
**Answer:** The User Panel **never talks to the database directly**. Instead, it follows a strict 3-layer architecture:

```
[React Component] → apiFetch("/products") → [Express API Route] → [Controller] → [Mongoose Model] → [MongoDB]
```

**Step-by-step flow for fetching products on `Home.jsx`:**
1. The component's `useEffect()` hook runs when the page loads.
2. Inside it, `apiFetch("/products")` is called — this is a wrapper around JavaScript's `fetch()` that:
   - Prepends the API base URL (`http://localhost:5000/api`)
   - Attaches the JWT token from `localStorage` to the `Authorization` header
   - Checks the in-memory cache first (returns cached data if it's less than 30 seconds old)
3. The HTTP GET request hits the Express route `GET /api/products` on the backend.
4. The route file (`productRoutes.js`) maps this to the `getProducts` function in `productController.js`.
5. The controller calls `Product.find({})` — a Mongoose query that translates to a MongoDB `find` operation.
6. MongoDB returns the documents. Mongoose converts them to JavaScript objects.
7. The controller sends the JSON response back to the frontend.
8. `apiFetch()` parses the response, caches it, and returns the data to the component.
9. The component calls `setProducts(data)` to update React state, which triggers a **re-render** displaying the products.

**The same pattern applies to every page:**
- `Products.jsx` → `GET /api/products?search=...&category=...`
- `Orders.jsx` → `GET /api/orders/my` (only the logged-in user's orders)
- `Profile.jsx` → `GET /api/users/me` (only the logged-in user's profile)
- `Cart.jsx` → `GET /api/cart` (only the logged-in user's cart)

### Q8. How does the Shopping Cart work technically?
**Answer:** The cart is a **server-side persistent cart** managed through the `useCart()` custom React hook in `src/data/Usecart.js`.

**Architecture:**
- **Database Model:** The `Cart` schema in MongoDB stores `{ user: ObjectId, items: [{ product: ObjectId, qty: Number }] }`. Each user has exactly **one cart document** (enforced by `unique: true` on the `user` field).
- **Custom Hook (`useCart.js`):** This React hook wraps all cart operations and is instantiated in `App.jsx`. It exposes:
  - `cart` — array of cart items with product details
  - `addToCart(product)` — `POST /api/cart` with `{ productId, qty: 1 }`
  - `removeFromCart(id)` — `DELETE /api/cart/:id`
  - `increaseQty(id)` / `decreaseQty(id)` — `PATCH /api/cart` with updated quantity
  - `clearCart()` — `DELETE /api/cart` (clears all items)
  - `cartCount` — total number of items computed via `cart.reduce()`

**Data Mapping:** When cart data comes from the backend, the `mapCartItems()` function transforms the raw MongoDB response (which uses nested `item.product._id`, `item.product.name`) into a flat structure that the UI components can easily consume.

**Auth-Aware Loading:** The hook polls `localStorage` every 500ms to detect login/logout changes. When the auth token changes (user logs in or out), it automatically re-fetches the cart for the new user or clears it.

### Q9. How does the Checkout and Payment process work?
**Answer:** Checkout is handled by `Checkout.jsx` and supports two payment methods:

**Cash on Delivery (COD):**
1. User fills the form (name, email, phone, address) and selects "Cash on Delivery".
2. Clicking "Place Order" calls `addOrder()` which sends `POST /api/orders` with `{ shippingAddress, paymentMethod: "Cash on Delivery" }`.
3. Backend creates the order with `paymentStatus: "Pending"`, decreases product stock, and clears the cart.
4. User is redirected to `/orders`.

**Online Payment (Razorpay):**
1. Frontend dynamically loads the Razorpay Checkout SDK script into the DOM.
2. Frontend calls `POST /api/orders/razorpay-create` — backend creates a Razorpay order using the Razorpay Node.js SDK with the total amount (in paise = amount × 100).
3. Backend returns the `order_id`, `amount`, `currency`, and `key` to the frontend.
4. Frontend opens the Razorpay payment popup with `new window.Razorpay(options).open()`.
5. After successful payment, Razorpay calls the `handler` callback with `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`.
6. Frontend sends these to `POST /api/orders` where the backend **verifies the signature** using HMAC SHA-256: `hmac.update(razorpay_order_id + "|" + razorpay_payment_id)`. If the generated hash matches the signature, payment is confirmed.
7. Order is created with `paymentStatus: "Paid"`.

**Buy Now vs Cart Flow:** `Checkout.jsx` supports both flows using `useLocation().state.buyNowItems`. If a user clicks "Buy Now" on a product, only that single product is passed to checkout (bypassing the cart entirely). If coming from the cart page, all cart items are used.

### Q10. How does the User Profile page work?
**Answer:** The `Profile.jsx` component manages user profile data with a **view/edit toggle pattern**:

1. **Data Loading:** On mount, `useEffect()` calls `apiFetch("/users/me")` which hits `GET /api/users/me`. The backend middleware extracts the user ID from the JWT token, queries `User.findById(req.user._id).select("-password")` (excluding the password field), and returns the user document.
2. **View Mode:** Displays name, email, phone, avatar in read-only cards.
3. **Edit Mode:** Toggled by clicking "Edit Profile". Form fields become editable. User can change name, phone, and even upload a new avatar photo (converted to a data URL via `FileReader`).
4. **Save Process:** Clicking "Save Changes" calls `apiFetch("/users/me", { method: "PUT", body: ... })` which updates the User document in MongoDB with `user.save()`.
5. **Email Protection:** The email field is **disabled** in edit mode — email cannot be changed after registration to maintain account integrity.

---

## 3. Admin Panel (`src/admin/`) — Deep Technical Q&A

### Q11. What is the Admin Panel and what pages does it contain?
**Answer:** The Admin Panel is the **store management** side of Sparekart. It is located in `src/admin/` and has a completely different UI layout from the User Panel — it uses a **sidebar navigation** (`AdminLayout.jsx`) instead of a top navbar.

| Page File | Route | Purpose |
|-----------|-------|---------|
| `Admindashboard.jsx` | `/admin/dashboard` | Analytics dashboard with stats cards, order status, low stock alerts, category breakdown |
| `Adminproducts.jsx` | `/admin/products` | Full CRUD (Create, Read, Update, Delete) management for products |
| `AdminOrders.jsx` | `/admin/orders` | View all orders from all users with payment status |
| `AdminOrderDetails.jsx` | `/admin/order/:id` | Detailed view of a specific order with customer info |
| `AdminUsers.jsx` | `/admin/users` | View/manage all registered users, block/activate accounts, delete users |
| `AdminFeedback.jsx` | `/admin/feedback` | View customer feedback submissions |
| `AdminProfile.jsx` | `/admin/profile` | Admin's own profile management |

### Q12. How does the Admin Dashboard fetch aggregated statistics from the database?
**Answer:** The dashboard uses **MongoDB Aggregation Pipelines** for high-performance analytics. When `AdminDashboard.jsx` loads, it calls `apiFetch("/admin/dashboard")` which triggers `getDashboardStats()` in the backend.

The backend executes **5 parallel database queries** using `Promise.all()` for maximum speed:

```javascript
const [productCount, userCount, orderStats, lowStock, categoryBreakdown] = await Promise.all([
  Product.countDocuments(),                           // 1. Total products count
  User.countDocuments({ role: "user" }),               // 2. Total customers (non-admin)
  Order.aggregate([{                                   // 3. Order + revenue stats
    $group: {
      _id: null,
      total: { $sum: 1 },
      paidOrders: { $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] } },
      pendingOrders: { $sum: { $cond: [{ $eq: ["$paymentStatus", "Pending"] }, 1, 0] } },
      totalRevenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$totalAmount", 0] } }
    }
  }]),
  Product.find({ stock: { $lt: 15 } }).select("name stock category").lean(), // 4. Low stock alerts
  Product.aggregate([                                  // 5. Products per category
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $project: { _id: 0, label: "$_id", count: 1 } }
  ])
]);
```

**Key Technical Points:**
- `countDocuments()` is used instead of fetching all documents — this is extremely fast because MongoDB just returns a count.
- The **aggregation pipeline** for orders computes paid/pending counts AND total revenue in a **single database pass** — no need to load all order documents into Node.js memory.
- `{ $cond: [condition, trueValue, falseValue] }` is the MongoDB equivalent of an if-else inside an aggregation.
- `.lean()` converts Mongoose documents to plain JavaScript objects, removing the overhead of Mongoose's change-tracking system.
- `Promise.all()` runs all 5 queries **concurrently** — they don't wait for each other.

### Q13. How does Admin Product Management (CRUD) work?
**Answer:** The `AdminProducts.jsx` component has three views controlled by a `view` state: `"list"`, `"add"`, and `"edit"`.

| Operation | HTTP Method | Endpoint | Backend Action |
|-----------|-------------|----------|----------------|
| **List Products** | `GET` | `/api/products` | `Product.find({})` — returns all products |
| **Add Product** | `POST` | `/api/products` | `Product.create({ name, category, price, stock, img, desc })` — inserts new document |
| **Edit Product** | `PUT` | `/api/products/:id` | `Product.findByIdAndUpdate(id, data, { new: true })` — updates and returns updated document |
| **Delete Product** | `DELETE` | `/api/products/:id` | `Product.findByIdAndDelete(id)` — removes the document permanently |

**Image Handling:** Products use **URL-based images** — the admin enters a direct image URL (e.g., from Cloudinary or any CDN). The URL string is stored in the `img` field of the Product schema. This approach avoids bloating the database with large Base64 image strings.

**After every mutation** (add/edit/delete), the component calls `loadProducts()` again to re-fetch the latest data from the database, ensuring the UI is always in sync.

### Q14. How does the Admin Users page work? How can admin manage users?
**Answer:** The `AdminUsers.jsx` component fetches all users via `GET /api/admin/users`. The backend controller:

1. Queries all non-admin users: `User.find({ role: { $nin: ["admin", "Admin"] } }).select("-password").lean()`
2. Runs a **separate aggregation** on the Orders collection to get per-user order counts and total spend:
   ```javascript
   Order.aggregate([{ $group: { _id: "$user", orderCount: { $sum: 1 }, totalSpent: { $sum: "$totalAmount" } } }])
   ```
3. Builds a **hashmap** (`statsMap`) for O(1) lookup of each user's order stats.
4. Maps users with their stats and sends the enriched list to the frontend.

**Admin Actions:**
- **Block/Activate User:** `PUT /api/admin/users/:id/status` — changes the `status` field to "Active", "Inactive", or "Blocked". When a blocked user tries to login, the backend checks `if (user.status === "Blocked")` and returns a `403 Forbidden` response before even verifying the password.
- **Delete User:** `DELETE /api/admin/users/:id` — performs **cascade deletion** using `Promise.all()`:
  ```javascript
  await Promise.all([
    Order.deleteMany({ user: id }),    // Delete all user's orders
    Cart.deleteMany({ user: id }),      // Delete user's cart
    User.deleteOne({ _id: id })         // Delete the user document
  ]);
  ```

---

## 4. How Admin Panel & User Panel Are Connected

### Q15. How are the Admin Panel and User Panel connected? Are they separate applications?
**Answer:** No, they are **NOT** separate applications. Both panels live inside the **same React Single-Page Application (SPA)** and share the **same backend server**. Here's how they are connected:

**Frontend Connection:**
- `App.jsx` (the root component) defines ALL routes for both panels in a single `<Routes>` block:
  - User routes: `/home`, `/products`, `/cart`, `/checkout`, `/orders`, `/profile`, etc.
  - Admin routes: `/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/users`, etc.
- Both panels use the **same `apiFetch()` function** from `src/data/api.js` to communicate with the backend.
- Both panels share the **same authentication system** — the JWT token stored in `localStorage`.

**Backend Connection:**
- The single Express server (`server/index.js`) mounts all routes:
  ```javascript
  app.use("/api/users", require("./routes/userRoutes"));      // Shared auth routes
  app.use("/api/products", require("./routes/productRoutes")); // Shared product routes
  app.use("/api/cart", require("./routes/cartRoutes"));        // User cart routes
  app.use("/api/orders", require("./routes/orderRoutes"));     // User order routes  
  app.use("/api/admin", require("./routes/adminRoutes"));      // Admin-only routes
  ```
- Admin routes (`/api/admin/*`) hit different controller functions that are unrestricted by user context (e.g., `Order.find({})` instead of `Order.find({ user: req.user._id })`).

**Key Difference:** The admin panel calls endpoint paths like `/admin/dashboard`, `/admin/orders`, `/admin/users` — these backend routes return **ALL data across ALL users**. The user panel calls paths like `/orders/my`, `/users/me`, `/cart` — these routes are filtered by `req.user._id` (the logged-in user's ID extracted from the JWT token).

### Q16. How does the system determine whether a user is an Admin or a regular User?
**Answer:** The determination happens through the **`role` field** in the User MongoDB schema:

```javascript
role: { type: String, enum: ["user", "admin", "User", "Admin"], default: "user" }
```

**Login Flow:**
1. User submits email + password on `Login.jsx`.
2. Backend validates credentials and returns `{ token, user: { id, name, email, role } }`.
3. Frontend checks `data.user.role`:
   ```javascript
   if (data.user.role === "admin" || data.user.role === "Admin") {
     setAdminLogin(true);           // Set flag in localStorage
     navigate("/admin/dashboard");   // Redirect to admin panel
   } else {
     setAdminLogin(false);
     navigate("/home");              // Redirect to user panel
   }
   ```
4. The `isAdminLoggedIn()` helper reads the `sparekart_admin` flag from `localStorage` to maintain the admin state across page refreshes.

**How to make someone an Admin:** A utility script `server/scripts/makeAdmin.js` directly sets a user's role to `"admin"` in the database:
```bash
node server/scripts/makeAdmin.js user@email.com
```

---

## 5. Session Management & Authentication — Deep Technical Q&A

### Q17. How does session management work in Sparekart? Does it use traditional cookies/sessions?
**Answer:** No, Sparekart does **NOT** use traditional cookie-based server sessions. Instead, it uses **Stateless JWT-Based Authentication**:

**How it works:**
1. **Login:** Backend generates a JWT token signed with a secret key (`process.env.JWT_SECRET`) with a 7-day expiration:
   ```javascript
   jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
   ```
2. **Storage:** The token + user info is stored in the browser's `localStorage` under the key `sparekart_auth`:
   ```javascript
   localStorage.setItem("sparekart_auth", JSON.stringify({ token, user }))
   ```
3. **Every API Request:** The `apiFetch()` function automatically reads the token from `localStorage` and attaches it to every HTTP request:
   ```javascript
   if (auth?.token) headers.Authorization = `Bearer ${auth.token}`;
   ```
4. **Backend Verification:** The `protect` middleware intercepts incoming requests, extracts the token from the `Authorization` header, verifies it with `jwt.verify(token, process.env.JWT_SECRET)`, and loads the user from the database:
   ```javascript
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   const user = await User.findById(decoded.userId).select("-password");
   req.user = user;  // Attach user to request object
   next();            // Allow the request to proceed
   ```
5. **Logout:** Frontend deletes the token from `localStorage`, clears the admin flag, and wipes the API cache:
   ```javascript
   clearAllCache();    // Wipe cached API responses
   clearStoredAuth();  // Remove token from localStorage
   setAdminLogin(false);
   navigate("/login");
   ```

**Why JWT over Sessions?**
- **Stateless:** The server doesn't need to store session data in memory or a database. Each token is self-contained — it carries the user's ID inside it.
- **Scalable:** If we later add multiple backend servers (load balancing), any server can verify the token independently without shared session storage.
- **SPA-Friendly:** Works naturally with React's client-side routing.

### Q18. How long does a user stay logged in? What happens when the token expires?
**Answer:** The JWT token expires after **7 days** (`expiresIn: "7d"`). During these 7 days, the user remains logged in even if they close and reopen the browser (because the token persists in `localStorage`). After expiry:
1. The backend's `jwt.verify()` throws an error.
2. The middleware returns `401 Unauthorized`.
3. The frontend's `apiFetch()` throws an error.
4. The user must log in again to get a fresh token.

---

## 6. User Data Isolation & Security — Deep Technical Q&A

### Q19. How are users separated? Can User A see User B's orders or cart?
**Answer:** Absolutely **NOT**. User data isolation is enforced at **three critical levels**:

**Level 1 — Backend Database Queries (Server-Side Enforcement):**
Every user-specific query filters by `req.user._id` — which is the logged-in user's MongoDB ID extracted from their JWT token:
- **Cart:** `Cart.findOne({ user: req.user._id })` — only returns the logged-in user's cart.
- **Orders:** `Order.find({ user: req.user._id })` — only returns the logged-in user's orders.
- **Profile:** `User.findById(req.user._id)` — only returns the logged-in user's data.
- **Single Order:** `Order.findOne({ _id: req.params.id, user: req.user._id })` — ensures user can only view their OWN orders. Even if someone guesses another order's ID, the `user` filter blocks access.

**Level 2 — API Cache Isolation (Frontend Enforcement):**
The `apiFetch()` function includes the user's JWT token in cache keys to prevent cross-user data leaks:
```javascript
const cacheKey = `${auth?.token || "anon"}::${path}`;
```
So `User-A-token::/orders/my` and `User-B-token::/orders/my` are completely separate cache entries.

**Level 3 — Cache Invalidation on Auth Changes:**
Whenever a user logs in, logs out, or registers, ALL cached API data is **completely wiped**:
```javascript
clearAllCache(); // Called in Login.jsx, Adminlayout.jsx logout, Register.jsx
```
This ensures that when User B logs in after User A, there's zero chance of seeing User A's stale cached data.

### Q20. How does the auth token polling mechanism work for detecting login/logout?
**Answer:** The `useCart()` and `useOrders()` custom hooks both implement a **polling mechanism** to detect auth state changes:

```javascript
useEffect(() => {
  const checkAuth = () => {
    const currentToken = getStoredAuth()?.token || null;
    if (currentToken !== authToken) {
      setAuthToken(currentToken);  // Triggers a re-fetch via the dependency array
    }
  };
  const interval = setInterval(checkAuth, 500); // Check every 500ms
  return () => clearInterval(interval);
}, [authToken]);
```

**Why polling instead of events?**
- `localStorage` does not fire events within the **same tab** — events are only dispatched to other tabs. Since login/logout happens in the same tab, we need polling.
- The 500ms interval is lightweight and ensures the cart/orders re-fetch within half a second of any auth change.

**When `authToken` changes:**
- If the token is now `null` (user logged out) → cart and orders are set to empty arrays.
- If the token changed to a new value (different user logged in) → cart and orders are re-fetched from the backend for the new user.

---

## 7. Frontend Caching System — Deep Technical Q&A

### Q21. What is the API caching system and why is it needed?
**Answer:** Sparekart implements an **in-memory cache with TTL (Time-To-Live)** in the `apiFetch()` function to avoid excessive API calls:

```javascript
const apiCache = {};
const CACHE_TTL = 30000; // 30 seconds
```

**How it works:**
1. When a `GET` request is made, `apiFetch()` first checks if a cached response exists and is fresh (less than 30 seconds old).
2. If yes → returns the cached data **instantly** without making a network request. This makes page transitions feel instantaneous.
3. If no (or stale) → makes the actual API call, caches the response, and returns it.
4. **After any mutation** (POST, PUT, DELETE, PATCH), the cache for the affected resource path is **automatically invalidated**:
   ```javascript
   const basePath = "/" + path.split("/").filter(Boolean)[0];
   invalidateCache(basePath);       // E.g., invalidate all "/products" cache
   invalidateCache("/admin");        // Also invalidate admin dashboard data
   ```

**Why is it needed?**
- Without caching, navigating between pages would trigger repeated API calls even though the data hasn't changed.
- The 30-second TTL ensures data stays reasonably fresh while avoiding unnecessary network overhead.

### Q22. How does cache invalidation prevent stale data after mutations?
**Answer:** After any non-GET request (POST/PUT/DELETE/PATCH), `apiFetch()` automatically invalidates all cache entries whose path starts with the resource's base path:

For example, after `POST /api/products` (adding a new product):
- `/products` cache is invalidated → next time anyone visits the products page, fresh data is fetched.
- `/admin` cache is also invalidated → dashboard statistics update to reflect the new product count.

This happens through this code:
```javascript
if (!isGet) {
  const basePath = "/" + path.split("/").filter(Boolean)[0];
  invalidateCache(basePath);
  invalidateCache("/admin"); // Dashboard depends on multiple resources
}
```

---

## 8. Backend Server Architecture — Deep Technical Q&A

### Q23. What is the complete folder structure and role of each file in the `server/` folder?
**Answer:** The `server/` folder follows the **MVC (Model-View-Controller)** pattern:

| Folder/File | Role |
|-------------|------|
| `index.js` | **Entry point** — boots Express server, applies middleware (CORS, JSON parser, timeout), mounts all route modules |
| `config/db.js` | MongoDB connection using `mongoose.connect(process.env.MONGO_URI)` |
| `config/mailer.js` | Nodemailer SMTP setup for OTP emails using Gmail App Passwords |
| `models/User.js` | Mongoose schema: `{ name, email, password, role, phone, address, avatar, status }` |
| `models/Product.js` | Mongoose schema: `{ name, category, price, stock, img, desc }` |
| `models/Order.js` | Mongoose schema: `{ user, items[], shippingAddress, paymentMethod, paymentStatus, totalAmount }` |
| `models/Cart.js` | Mongoose schema: `{ user (unique), items[{ product, qty }] }` |
| `models/Otp.js` | Mongoose schema: `{ email, otp, name, password, phone }` with TTL auto-expiry |
| `models/Feedback.js` | Mongoose schema: `{ message }` |
| `controllers/userController.js` | Business logic for login, register, OTP, profile (getMe/updateMe), forgot password |
| `controllers/productController.js` | CRUD logic for products |
| `controllers/cartController.js` | Logic for add/remove/update cart items |
| `controllers/orderController.js` | Logic for creating orders, Razorpay integration, fetching orders |
| `controllers/adminController.js` | Dashboard stats, user management (list/block/delete) |
| `controllers/feedbackController.js` | Feedback submission logic |
| `routes/userRoutes.js` | Maps `/api/users/*` URLs to userController functions |
| `routes/productRoutes.js` | Maps `/api/products/*` URLs to productController functions |
| `routes/cartRoutes.js` | Maps `/api/cart/*` URLs to cartController functions (protected) |
| `routes/orderRoutes.js` | Maps `/api/orders/*` URLs to orderController functions (protected) |
| `routes/adminRoutes.js` | Maps `/api/admin/*` URLs to adminController functions |
| `routes/feedbackRoutes.js` | Maps `/api/feedback/*` URLs |
| `middleware/authMiddleware.js` | JWT verification middleware — extracts and validates tokens |
| `scripts/makeAdmin.js` | Utility script to promote a user to admin role |
| `.env` | Secret environment variables (MongoDB URI, JWT Secret, Razorpay keys, SMTP credentials) |

### Q24. How exactly does Express.js route an incoming API request?
**Answer:** Here's the complete journey of a request:

```
Frontend: apiFetch("/orders/my") → HTTP GET http://localhost:5000/api/orders/my
                                          ↓
Server (index.js): app.use("/api/orders", require("./routes/orderRoutes"))
                                          ↓
Router (orderRoutes.js): router.get("/my", protect, getMyOrders)
                                          ↓
Middleware (authMiddleware.js): Extract JWT → verify → load user → req.user = user → next()
                                          ↓
Controller (orderController.js): getMyOrders → Order.find({ user: req.user._id }).sort(...)
                                          ↓
Mongoose → MongoDB Atlas → Returns documents → res.json(orders) → Frontend receives data
```

### Q25. What is the difference between `routes` and `controllers`?
**Answer:** This follows the **Separation of Concerns** principle:
- **Routes** are the "traffic cops" — they ONLY define URL patterns and map them to specific functions. They answer: *"When someone visits this URL with this HTTP method, which function should handle it?"*
- **Controllers** are the "business logic workers" — they contain the actual database queries, data validation, transformations, and response construction.

If we dumped 200 lines of database querying, validation, and computation directly into the routing file, the code would become an unreadable, monolithic mess. This separation keeps each file focused and maintainable.

### Q26. How does the `protect` middleware physically block unauthorized access?
**Answer:** The middleware acts as a **security checkpoint**:

1. Checks if the `Authorization` header exists and starts with `"Bearer "`.
2. If not → immediately returns `401 Unauthorized` (request is killed here, controller never runs).
3. Extracts the token and calls `jwt.verify(token, secret)`.
4. If the token is expired, tampered with, or invalid → `jwt.verify()` throws an error → `401 Unauthorized`.
5. Uses the decoded `userId` to find the user in the database.
6. If user doesn't exist (deleted account) → `401 Unauthorized`.
7. Only if ALL checks pass → attaches `req.user = user` and calls `next()` to let the request proceed to the controller.

**This means:** Even if a hacker discovers an API URL like `/api/admin/dashboard`, they cannot access it without a valid JWT token that belongs to a real user in the database.

### Q27. How are passwords stored? Can the admin see user passwords?
**Answer:** Passwords are **NEVER** stored in plain text. We use `bcryptjs` for **one-way cryptographic hashing**:

```javascript
const salt = await bcrypt.genSalt(10);          // Generate random salt (10 rounds)
const hashed = await bcrypt.hash(password, salt); // Hash: "12345" → "$2a$10$wK1F..."
```

- The hash is **irreversible** — you cannot convert `$2a$10$wK1F...` back to `12345`.
- During login, `bcrypt.compare(inputPassword, storedHash)` re-computes the hash and compares.
- The admin's `getAllUsers` query explicitly excludes passwords: `.select("-password")`.
- Even if the entire database is leaked, passwords remain secure because bcrypt's computational cost makes brute-force attacks impractical.

---

## 9. Database Models & Schema Design — Technical Q&A

### Q28. How is the database schema designed? What relationships exist between collections?
**Answer:** Sparekart uses **6 MongoDB collections** with the following relationships:

```
Users ←──────── Orders (one-to-many: one user can have many orders)
  ↑                  ↓
  ├──────── Cart (one-to-one: each user has exactly one cart)
  │                  ↓
Products ←──── Cart.items[].product (reference via ObjectId)
  ↑
  └──── Orders.items[].product (reference via ObjectId)
  
OTP (temporary, auto-expires)
Feedback (standalone, unlinked)
```

**Mongoose Relationships:**
- `Cart.user` → references `User._id` (with `unique: true` — enforces one cart per user)
- `Cart.items[].product` → references `Product._id` (allows `.populate("items.product")` to join product details)
- `Order.user` → references `User._id` (allows `.populate("user", "name email")` for admin views)
- `Order.items[].product` → references `Product._id`

**Database Indexes for Performance:**
```javascript
userSchema.index({ email: 1 });              // Fast login lookups
userSchema.index({ role: 1 });               // Fast admin user listing
orderSchema.index({ user: 1, createdAt: -1 }); // Fast user order history
orderSchema.index({ createdAt: -1 });        // Fast admin order listing
```

### Q29. What is `.populate()` and how does it work in this project?
**Answer:** `.populate()` is Mongoose's way of performing a **JOIN operation** (similar to SQL JOINs) in MongoDB. Since MongoDB is NoSQL and doesn't have native joins, Mongoose handles it:

- **Without populate:** `Order.find({})` returns `{ user: "60f5a3b2..." }` — just the ObjectId.
- **With populate:** `Order.find({}).populate("user", "name email")` returns `{ user: { _id: "60f5a3b2...", name: "John", email: "john@example.com" } }` — the full user document is embedded.

**Used in Sparekart:**
- **Admin Orders page:** `Order.find({}).populate("user", "name email")` — fetches orders with customer name/email attached.
- **Cart loading:** `Cart.findOne({ user }).populate("items.product")` — fetches cart with full product details (name, price, stock, img) attached to each cart item.

---

## 10. Potential Viva/Interview Questions — Technical Q&A Checklist

**Q. Why did you choose React over traditional HTML/JS for this project?**
> React's **component-based architecture** allows reusable code (Navbar, Footer, Product Cards). Its **Virtual DOM** ensures blazing fast UI updates — critical for shopping carts that must re-compute totals dynamically without full page refreshes. React Router enables **client-side navigation** (SPA), making the app feel like a native mobile experience.

**Q. Why use NoSQL (MongoDB) instead of SQL (MySQL)?**
> E-commerce catalogs require **flexible schemas** — a "Brake Pad" might have different attributes than "Engine Oil". MongoDB's JSON document structure stores varying attributes without maintaining rigid table schemas. MongoDB Atlas also provides easy cloud deployment with built-in replication and backup.

**Q. How do you prevent users from injecting malicious data?**
> **Defense-in-Depth:** (1) Frontend React forms validate inputs before sending. (2) Backend Express controllers re-validate all data. (3) Mongoose schemas enforce strict data types (`String`, `Number`, `Boolean`) — any malformed data is automatically rejected before reaching MongoDB.

**Q. What happens if Razorpay payment succeeds but the database fails?**
> The backend **verifies the Razorpay signature** using HMAC SHA-256 before creating the order. If verification passes but `Order.create()` fails, the payment is recorded on Razorpay's end and can be reconciled. In production, we'd implement Razorpay **webhooks** for server-to-server payment confirmation to handle such edge cases.

**Q. Is this a Single Page Application (SPA)?**
> Yes! Using React and `react-router-dom`, the browser downloads the application once. Clicking navigation links doesn't load new HTML pages — it simply re-renders React components locally, giving a lightning-fast experience comparable to a native app.

**Q. Why use `async/await` instead of `.then()` chains or callbacks?**
> `async/await` is syntactic sugar over Promises that makes asynchronous code read like synchronous code. It dramatically improves readability — instead of nested `.then().then().catch()` chains, we write clean linear code with `try/catch` blocks for error handling.

**Q. How does the system handle concurrent requests from multiple users?**
> Node.js uses a **single-threaded event loop** with non-blocking I/O. Database queries (`await Product.find()`) don't block the thread — Node registers a callback and continues serving other requests. When MongoDB responds, the callback resolves and the response is sent. This architecture efficiently handles thousands of concurrent users without spawning threads.

**Q. What security measures are implemented?**
> - JWT-based authentication with 7-day expiry
> - bcrypt password hashing (10 salt rounds)
> - CORS middleware restricting cross-origin requests
> - User status check (blocked users cannot login)
> - Razorpay payment signature verification (HMAC SHA-256)
> - Database query scoping (`req.user._id` filter on all user-specific queries)
> - Request timeout middleware (15 seconds)
> - JSON body size limit (5MB)
> - Password field excluded from all API responses (`.select("-password")`)
## 11. `package.json` — Complete Explanation

### Q30. What is `package.json` and why does the project have TWO of them?
**Answer:** `package.json` is the **heart of any Node.js/JavaScript project**. It is a JSON configuration file that defines:
- The project's **name and version**
- All **dependencies** (libraries the project needs)
- **Scripts** (shortcut commands to run/build the project)
- **Metadata** (author, license, etc.)

Sparekart has **TWO** `package.json` files because the project has two separate JavaScript environments:
1. **`/package.json`** — for the **Frontend** (React + Vite)
2. **`/server/package.json`** — for the **Backend** (Node.js + Express)

Each has its own independent dependencies and scripts because the frontend and backend use completely different libraries.

### Q31. Explain the Frontend `package.json` line by line.
**Answer:** Here is the complete frontend `package.json`:

```json
{
  "name": "sparekart",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "jspdf": "^4.2.1",
    "jspdf-autotable": "^5.0.7",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.13.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "vite": "^7.3.1"
  }
}
```

**Field-by-field explanation:**

| Field | Value | Meaning |
|-------|-------|---------|
| `"name"` | `"sparekart"` | Project name identifier |
| `"private"` | `true` | Prevents accidental publishing to npm registry |
| `"version"` | `"0.0.0"` | Current version of the project |
| `"type"` | `"module"` | Uses ES Module syntax (`import/export`) instead of CommonJS (`require/module.exports`) |

**Scripts:**

| Script | Command | What it does |
|--------|---------|-------------|
| `npm run dev` | `vite` | Starts the development server at `localhost:5173` with Hot Module Replacement (HMR) |
| `npm run build` | `vite build` | Creates a production-optimized build in the `/dist` folder |
| `npm run lint` | `eslint .` | Checks code for errors and style issues |
| `npm run preview` | `vite preview` | Serves the production build locally for testing |

**Dependencies (required for the app to run):**

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | `^19.2.0` | Core React library — builds the UI using a component-based architecture |
| `react-dom` | `^19.2.0` | Renders React components into the browser's real DOM |
| `react-router-dom` | `^7.13.0` | Client-side routing — enables SPA navigation without page reloads (`<Route>`, `<Link>`, `useNavigate()`) |
| `jspdf` | `^4.2.1` | Generates PDF documents entirely in the browser (used for order bills) |
| `jspdf-autotable` | `^5.0.7` | Plugin for jsPDF that creates formatted tables (used for product itemization in bills) |

**DevDependencies (only needed during development, NOT in production):**

| Package | Purpose |
|---------|---------|
| `vite` | Ultra-fast build tool and dev server using native ES modules |
| `@vitejs/plugin-react` | Vite plugin that enables JSX transformation and React Fast Refresh |
| `eslint` | Static code analysis tool — finds bugs and enforces coding standards |
| `eslint-plugin-react-hooks` | ESLint rules for correct React Hooks usage |
| `eslint-plugin-react-refresh` | Ensures components are compatible with hot module replacement |
| `@types/react`, `@types/react-dom` | TypeScript type definitions for IDE autocompletion |
| `globals` | Provides browser global variables (like `window`, `document`) for ESLint |

### Q32. Explain the Backend `package.json` line by line.
**Answer:** Here is the complete backend `server/package.json`:

```json
{
  "name": "server",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "nodemon index.js",
    "start": "node index.js"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.6",
    "dotenv": "^17.3.1",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.3.2",
    "nodemailer": "^8.0.4",
    "razorpay": "^2.9.6"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

**Field-by-field explanation:**

| Field | Value | Meaning |
|-------|-------|---------|
| `"name"` | `"server"` | Backend project identifier |
| `"version"` | `"1.0.0"` | Stable version |
| `"main"` | `"index.js"` | The entry point file — `node index.js` starts here |

**Scripts:**

| Script | Command | What it does |
|--------|---------|-------------|
| `npm run dev` | `nodemon index.js` | Starts server with **auto-restart** on file changes (development) |
| `npm start` | `node index.js` | Starts server normally (production) |

**Dependencies (every package explained):**

| Package | Version | What it does in Sparekart |
|---------|---------|--------------------------|
| `express` | `^5.2.1` | **Web framework** — handles HTTP routing, middleware, request/response cycle. It's the backbone of the backend server. Routes like `GET /api/products` are defined using Express. |
| `mongoose` | `^9.3.2` | **MongoDB ODM** — provides schema definitions, data validation, and query building. Converts JavaScript function calls like `User.findOne({email})` into MongoDB database operations. |
| `bcryptjs` | `^3.0.3` | **Password hashing** — uses the bcrypt algorithm with salt rounds to one-way hash passwords before storing them. During login, `bcrypt.compare()` verifies passwords without ever decrypting them. |
| `jsonwebtoken` | `^9.0.3` | **JWT authentication** — `jwt.sign()` creates tokens during login, `jwt.verify()` validates tokens on every protected API request. Tokens contain the user's ID encoded inside them. |
| `cors` | `^2.8.6` | **Cross-Origin Resource Sharing** — allows the frontend (running on port 5173) to make API requests to the backend (running on port 5000). Without CORS, browsers block cross-origin requests. |
| `dotenv` | `^17.3.1` | **Environment variables** — loads secrets from the `.env` file into `process.env`. This keeps sensitive data (database passwords, API keys) out of the source code. |
| `nodemailer` | `^8.0.4` | **Email sending** — connects to Gmail's SMTP server to send OTP verification emails. Configured with connection pooling and rate limiting to prevent abuse. |
| `razorpay` | `^2.9.6` | **Payment gateway SDK** — handles online payment processing. `instance.orders.create()` creates Razorpay payment orders. Also provides tools for signature verification (HMAC SHA-256). |

**DevDependencies:**

| Package | Purpose |
|---------|---------|
| `nodemon` | Automatically restarts the server whenever a code file changes during development. Without nodemon, you'd have to manually stop and restart the server after every edit. |

### Q33. What is the difference between `dependencies` and `devDependencies`?
**Answer:**
- **`dependencies`** — Required for the app to **run in production**. These packages are bundled into the final application. Example: `react`, `express`, `mongoose`.
- **`devDependencies`** — Required **only during development**. They help with building, testing, and linting but are NOT needed when the app runs in production. Example: `vite`, `eslint`, `nodemon`.

When deploying to production, running `npm install --production` installs only `dependencies`, saving disk space and reducing attack surface.

---

**End of Documentation**
