# BÁO CÁO KIỂM THỬ PHẦN MỀM (LTWNC - TUẦN 6)

**Học phần:** Lập trình Web Nâng cao (LTWNC)  
**Bài tập:** Tuần 6 - Kiểm thử (Testing with Vitest, RTL & Mocked API)  
**Module lựa chọn kiểm thử:** Module Giỏ hàng (**Cart Module**) & Tích hợp Danh mục Sản phẩm (**Products Feature**)  
**Tiêu chuẩn chất lượng:** Test Coverage đạt **100%** (Vượt ngưỡng yêu cầu $\ge 70\%$).

---

## 1. TỔNG QUAN BÀI TOÁN KIỂM THỬ

### 1.1. Mục tiêu
Thiết kế bộ kiểm thử toàn diện từ mức **Unit Test**, **Integration Test** đến **Asynchronous API Mocking Test** cho module Giỏ hàng (`src/features/cart`) đã xây dựng từ các tuần trước.

### 1.2. Công nghệ sử dụng
- **Test Runner:** Vitest v5.0.3 (Engine tương đương và tương thích 1-1 với Jest trong hệ sinh thái Vite/React hiện đại).
- **DOM Environment:** `jsdom` v30.0.1.
- **Component Testing:** `@testing-library/react` v16.3.3 & `@testing-library/jest-dom` v7.0.1.
- **Coverage Engine:** `@vitest/coverage-v8` (Istanbul / V8 code coverage provider).
- **Asynchronous Data Management:** `@tanstack/react-query` v5.102.8.
- **Client State Management:** `zustand` v5.0.15.

---

## 2. DANH SÁCH TEST CASES CHI TIẾT

Bộ test bao gồm **31 test cases** chuyên biệt cho Module Giỏ hàng và Sản phẩm (Tổng cộng **52 test cases** trên toàn bộ dự án đều PASS 100%).

### 2.1. Nhóm Unit Test: Store & Atomic Selectors (`store.test.ts`)
Kiểm thử trực tiếp logic nghiệp vụ lưu trữ trạng thái giỏ hàng (Zustand store & pure functions) độc lập với UI:
1. `should initialize with an empty item list and zero count/total`: Khởi tạo state rỗng, số lượng bằng 0, tổng tiền bằng 0.
2. `should add a new product with default quantity of 1`: Thêm sản phẩm mới với số lượng mặc định là 1.
3. `should add a new product with specified quantity`: Thêm sản phẩm mới với số lượng truyền vào tùy chọn.
4. `should increment quantity when adding an already existing product`: Cộng dồn số lượng khi thêm sản phẩm đã có trong giỏ hàng.
5. `should cap quantity to available product.stock when adding exceeds stock`: Giới hạn số lượng tối đa theo tồn kho (`product.stock`), không cho vượt quá.
6. `should support adding multiple distinct products to cart`: Thêm nhiều sản phẩm khác nhau và tính tổng tiền giỏ hàng chính xác.
7. `should remove product by productId`: Xóa sản phẩm theo `id` và cập nhật lại danh sách, tổng tiền.
8. `should update quantity of an item within valid stock limits`: Cập nhật số lượng sản phẩm trong ngưỡng tồn kho cho phép.
9. `should cap updated quantity at product.stock if requested quantity is higher`: Tự động chặn về giá trị `product.stock` khi người dùng nhập số lượng vượt quá kho.
10. `should remove item when quantity is updated to 0 or negative`: Tự động xóa sản phẩm khỏi giỏ hàng nếu cập nhật số lượng về 0 hoặc số âm.
11. `should clear all items in the cart`: Dọn dẹp sạch toàn bộ giỏ hàng khi kích hoạt action `clearCart`.
12. `preserves untouched items unchanged when incrementing or updating another item`: Đảm bảo các sản phẩm khác trong giỏ giữ nguyên trạng thái khi một sản phẩm được cập nhật (bao phủ 100% branch coverage).

### 2.2. Nhóm Integration Test: Component với React Testing Library
Kiểm thử tích hợp giao diện người dùng, bộ lắng nghe sự kiện và liên kết hai chiều giữa DOM và Store:

#### A. Component `CartButton` (`cart-button.test.tsx`)
13. `renders cart button without badge when cart is empty`: Nút giỏ hàng hiển thị bình thường và không hiện huy hiệu (badge) số lượng khi giỏ rỗng.
14. `renders badge with total item count when cart contains items`: Hiển thị badge màu đỏ với số lượng item chính xác khi có hàng.
15. `calls onOpen callback when user clicks cart button`: Kích hoạt hàm callback `onOpen` khi người dùng click vào nút.

#### B. Component `CartItemRow` (`cart-item-row.test.tsx`)
16. `renders item thumbnail, title, price breakdown and current quantity`: Hiển thị đầy đủ ảnh sản phẩm, tên, đơn giá, số lượng và thành tiền.
17. `increments quantity when clicking the plus button`: Click nút `+` gọi `updateQuantity` tăng thêm 1 đơn vị.
18. `disables the plus button when quantity reaches product stock limit`: Nút `+` tự động bị vô hiệu hóa (`disabled`) khi số lượng chạm trần tồn kho.
19. `decrements quantity when clicking the minus button`: Click nút `-` gọi `updateQuantity` giảm 1 đơn vị.
20. `disables the minus button when quantity is 1`: Nút `-` tự động bị vô hiệu hóa khi số lượng chỉ còn 1.
21. `removes product from store when clicking remove button`: Click icon thùng rác xóa sản phẩm ra khỏi Store.

#### C. Component `CartDrawer` (`cart-drawer.test.tsx`)
22. `renders empty state when cart has no items`: Hiển thị giao diện rỗng thông minh (*"Your cart is empty"*, *"No items yet"*), nút *"Clear cart"* bị disabled.
23. `renders items list, count, and subtotal when cart contains items`: Hiển thị danh sách các thẻ sản phẩm, số lượng và tổng tiền tạm tính (*Subtotal*).
24. `clears all items in the cart when user clicks 'Clear cart'`: Click nút *"Clear cart"* dọn sạch giỏ hàng và chuyển ngay về trạng thái Empty.
25. `does not render drawer content when open is false`: Không render nội dung Drawer khi cờ `open: false`.

### 2.3. Nhóm Asynchronous Test: Tích hợp API được Mock
Kiểm thử các kịch bản bất đồng bộ thời gian thực với Promise, TanStack Query và Mocked Network API:

#### A. Tích hợp API Sản phẩm & Thêm vào Giỏ (`cart-async-api.test.tsx`)
26. `fetches products asynchronously from mocked API and adds product to cart on user interaction`:
    - Giả lập hàm API `getProductsFn` phản hồi dữ liệu danh sách sản phẩm với độ trễ mạng (delayed Promise).
    - Kiểm chứng giao diện chuyển qua trạng thái Loading (`Loading products from API...`).
    - Chờ đợi Promise resolve (`await waitFor(...)`), kiểm chứng sản phẩm được hiển thị lên DOM.
    - Kích hoạt sự kiện người dùng bấm *"Add to cart"*, kiểm chứng Store giỏ hàng được cập nhật tức thì với đúng ID và đơn giá.
27. `handles asynchronous API error gracefully when server request fails`:
    - Giả lập API ném lỗi mạng bất đồng bộ (`Internal Server Error 500`).
    - Kiểm chứng component bắt lỗi và hiển thị thông báo Alert đúng nội dung lỗi mạng, giỏ hàng giữ nguyên không bị crash.
28. `asynchronously processes mock checkout API and clears cart on successful order`:
    - Đặt trước sản phẩm trong giỏ hàng.
    - Giả lập gọi API thanh toán bất đồng bộ `mockCheckoutApi` nhận vào danh sách sản phẩm.
    - Nhận phản hồi thành công (`{ success: true, orderId: "ORDER-78901", totalCharged: 150 }`).
    - Kích hoạt dọn sạch giỏ hàng sau khi đặt đơn thành công.

#### B. API Query Layer (`products/queries.test.tsx`)
29. `should have consistent query key hierarchy`: Đảm bảo quy chuẩn phân tầng Query Keys `["products", "list", { limit }]`.
30. `fetches product list asynchronously with mocked API and resolves data`: Gọi bất đồng bộ qua `QueryClient.fetchQuery` với mocked function, kiểm chứng resolve thành công dữ liệu hợp lệ.
31. `handles asynchronous API rejection and transitions query into error state`: Kiểm chứng `useQuery` chuyển từ trạng thái `isLoading` sang `isError` khi server function từ chối Promise.

---

## 3. KẾT QUẢ ĐO LƯỜNG CODE COVERAGE

Chạy lệnh kiểm thử với bộ thu thập độ phủ mã nguồn:
```bash
pnpm test:coverage
# hoặc: pnpm vitest run --coverage
```

### Bảng kết quả Coverage (Module Cart):
| Mục tiêu kiểm thử | % Statements | % Branch | % Functions | % Lines | Đánh giá |
|---|---|---|---|---|---|
| **Toàn bộ Module Cart (`src/features/cart`)** | **100%** (47/47) | **100%** (17/17) | **100%** (28/28) | **100%** (39/39) | 🟢 **Xuất sắc (100%)** |
| `src/features/cart/store.ts` | **100%** (26/26) | **100%** (9/9) | **100%** (18/18) | **100%** (21/21) | 🟢 **Tuyệt đối** |
| `src/features/cart/components/cart-button.tsx` | **100%** | **100%** | **100%** | **100%** | 🟢 **Tuyệt đối** |
| `src/features/cart/components/cart-drawer.tsx` | **100%** | **100%** | **100%** | **100%** | 🟢 **Tuyệt đối** |
| `src/features/cart/components/cart-item-row.tsx` | **100%** | **100%** | **100%** | **100%** | 🟢 **Tuyệt đối** |

> **Nhận xét:** Độ phủ mã nguồn đạt **100% trên tất cả các tiêu chí** (Statements, Branches, Functions, Lines), vượt xa yêu cầu tối thiểu **70%** của đề bài.

---

## 4. ẢNH BÁO CÁO COVERAGE

Ảnh chụp màn hình báo cáo HTML Coverage chuẩn Istanbul/V8 được lưu tại:
📁 `docs/testing/coverage-report.png`

![Coverage Report](file:///c:/Users/Foggo/Documents/Dev%20projects/ript1411-advanced-web-development/docs/testing/coverage-report.png)

---

## 5. HƯỚNG DẪN THỰC THI KIỂM THỬ

1. Chạy toàn bộ test suites:
   ```bash
   pnpm test
   ```
2. Chạy test và tạo báo cáo Coverage:
   ```bash
   pnpm test:coverage
   ```
3. Xem báo cáo giao diện trực quan trên trình duyệt:
   Mở file `coverage/index.html` bằng trình duyệt web.
