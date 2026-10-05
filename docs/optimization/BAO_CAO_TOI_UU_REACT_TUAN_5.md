# BÁO CÁO THỰC NGHIỆM TỐI ƯU HIỆU NĂNG REACTJS (LTWNC - TUẦN 5)

**Học phần:** Lập trình Web Nâng cao (LTWNC)  
**Bài tập:** Tuần 5 - Tối ưu React (Quản lý Catalog 10.000 Sản phẩm)  
**Mục tiêu:** Xây dựng trang quản lý 10.000 sản phẩm, đo lường bằng Google DevTools & Lighthouse trước khi tối ưu, áp dụng các kỹ thuật tối ưu hóa chuẩn công nghiệp (theo AnnoBot Engineering Handbook), và đo lường - đối chiếu số liệu sau tối ưu.

---

## 1. TỔNG QUAN BÀI TOÁN & KỊCH BẢN THỰC NGHIỆM

### 1.1. Bối cảnh bài toán
Trong các hệ thống thương mại điện tử và trang quản trị doanh nghiệp (Admin / ERP / E-commerce Catalog), việc quản lý và duyệt danh mục lớn với hàng chục nghìn sản phẩm là kịch bản rất phổ biến. Trang web yêu cầu:
- Tải và quản lý danh mục **10.000 sản phẩm**.
- Cung cấp thanh tìm kiếm tức thời theo từ khóa (tên sản phẩm, mô tả, thương hiệu).
- Bộ lọc danh mục đa dạng (smartphones, laptops, fragrances, skincare, groceries, v.v.).
- Bộ chọn sắp xếp linh hoạt (theo giá tăng/giảm, đánh giá, chiết khấu).
- Bảng điều khiển thống kê kho hàng theo thời gian thực (tổng sản phẩm, số lượng còn hàng, điểm đánh giá trung bình, tổng giá trị kho hàng).
- Thao tác tương tác mua hàng (thêm vào giỏ hàng, đánh dấu yêu thích) kích hoạt các Drawer giỏ hàng.

### 1.2. Môi trường kiểm thử
- **Hệ điều hành:** Windows 11 x64.
- **Runtime:** Node.js v22, pnpm v11.
- **Frontend Stack:** React 19, TanStack Start, TanStack Router, TanStack Query, Zustand v5, Tailwind CSS v4.
- **Công cụ đo lường:**
  1. **Google Lighthouse CLI v13.5.0** (Mobile Emulation & Desktop Preset).
  2. **Google Chrome DevTools Protocol (CDP)** qua script tự động hóa đo đạc trực tiếp các chỉ số Performance, Memory Heap, DOM Elements và Event Listeners trên trình duyệt Google Chrome v140+.
- **Tài liệu tham khảo tiêu chuẩn:** AnnoBot Engineering Handbook (`annobot-fe/docs/handbook/`) & AnnoBot AGENTS Rules.

---

## 2. HIỆN TRẠNG TRƯỚC KHI TỐI ƯU (BASELINE - UNOPTIMIZED)

### 2.1. Thiết kế mã nguồn chưa tối ưu
Ở phiên bản ban đầu, trang Shop được xây dựng theo cách thông thường mà các lập trình viên thường mắc phải khi chưa xử lý hiệu năng cho tập dữ liệu lớn:
1. **Render trực tiếp toàn bộ 10.000 phần tử vào DOM:** Duyệt qua mảng sản phẩm và render 10.000 thẻ `<ProductCard />` cùng lúc vào lưới CSS Grid (`grid-cols-4`).
2. **Không áp dụng Memoization:**
   - Component `<ProductCard />` không được bọc `React.memo`.
   - Mỗi lần component cha re-render, toàn bộ 10.000 phần tử bị lặp qua `.filter()`, `.sort()` và `.reduce()` để tính toán thống kê ngay trong thân hàm render mà không dùng `useMemo`.
   - Event handlers như `onAddToCart={() => addItem(product)}` được truyền dạng inline arrow function mới trên từng item, liên tục sinh ra tham chiếu mới.
   - Zustand Store không dùng atomic selector chuẩn mà kích hoạt render dây chuyền.
3. **Không có Route Code-Splitting:** Toàn bộ trang `shop.tsx` và các Drawer nặng (`CartDrawer`, `FavoritesDrawer`) được đóng gói nguyên khối (Monolithic bundle).
4. **Không có Concurrent Deferral:** Ô tìm kiếm cập nhật state trực tiếp (`onChange`), ép React phải lọc lại 10.000 sản phẩm và re-render toàn bộ DOM ngay trên mỗi phím bấm, gây nghẽn Main Thread trầm trọng.
5. **Dehydration HTML quá khổ:** Dữ liệu SSR serialize toàn bộ 10.000 sản phẩm vào file HTML gửi về client lên tới 15.1 MB.

### 2.2. Kết quả đo lường bằng Google DevTools & Lighthouse (TRƯỚC TỐI ƯU)

#### Bảng 1: Chỉ số Google Lighthouse (Mobile Emulation)
| Chỉ số Lighthouse | Kết quả Trước Tối Ưu | Đánh giá |
|---|---|---|
| **Performance Score** | **35 / 100** | 🔴 Vùng Đỏ (Rất kém, trải nghiệm giật lag nghiêm trọng) |
| **First Contentful Paint (FCP)** | **5.6 giây** | 🔴 Chậm chạp, người dùng phải chờ trắng màn hình |
| **Largest Contentful Paint (LCP)** | **5.6 giây** | 🔴 Vượt xa ngưỡng chuẩn khuyến nghị (< 2.5s) |
| **Total Blocking Time (TBT)** | **7,228 ms (~7.2 giây)** | 🔴 Main thread bị đóng băng hơn 7.2 giây! |
| **Cumulative Layout Shift (CLS)** | **0.001** | 🟢 Đạt chuẩn bố cục ổn định |
| **Speed Index (SI)** | **5.6 giây** | 🔴 Tốc độ dựng hình nội dung rất chậm |
| **Main Thread Work Breakdown** | **18,692 ms (~18.7 giây)** | 🔴 CPU ngốn gần 19 giây xử lý JavaScript |
| **Bootup Time** | **6,740 ms (~6.7 giây)** | 🔴 Khởi động script mất gần 7 giây |

> **Cảnh báo từ Lighthouse CLI:**
> Trình duyệt ghi nhận lỗi `PROTOCOL_TIMEOUT`: Hệ thống Google DevTools Protocol bị quá tải thời gian phản hồi khi duyệt cây Accessibility Tree vì số lượng DOM quá khổng lồ (>190.000 nodes).

#### Bảng 2: Chỉ số Google Chrome DevTools Protocol (CDP & Memory Heap)
| Chỉ số Chrome DevTools | Kết quả Trước Tối Ưu | Nhận xét kỹ thuật |
|---|---|---|
| **Tổng số phần tử DOM (`domNodeCount`)** | **190,104 nodes** | DOM Tree phình to vượt mức cho phép (>1.500 nodes của Lighthouse) hơn 126 lần |
| **Tổng số Node hệ thống (`nodesCount`)** | **250,299 nodes** | Gây quá tải bộ quản lý bộ nhớ của Chrome Render Engine |
| **Số lượng Event Listeners (`jsEventListeners`)** | **40,167 listeners** | Gắn quá nhiều bộ lắng nghe sự kiện gây rò rỉ và tiêu tốn CPU |
| **Dung lượng JS Heap sử dụng (`usedJSHeapMB`)** | **136.48 MB** | Tiêu tốn bộ nhớ RAM lớn cho Fiber tree và DOM references |
| **Tổng dung lượng JS Heap cấp phát (`totalJSHeapMB`)** | **195.38 MB** | Chiếm dụng tài nguyên hệ thống cao |
| **Thời gian tính toán bố cục (`layoutDurationSec`)** | **1.098 giây** | Trình duyệt mất hơn 1 giây chỉ để tính kích thước hộp (Box Model) |
| **Thời gian tính toán CSS Style (`recalcStyleDurationSec`)**| **0.817 giây** | Trình duyệt mất 817 ms để tính toán lại CSS rules |
| **Thời gian thực thi Script (`scriptDurationSec`)** | **1.246 giây** | Mã JavaScript chặn Main Thread kéo dài |
| **Tổng thời gian tác vụ Main Thread (`taskDurationSec`)** | **4.013 giây** | Chuỗi Long Tasks liên tục vượt ngưỡng 50ms |
| **Dung lượng Document HTML ban đầu** | **15,133,347 bytes (~15.1 MB)**| Payload HTML khổng lồ làm nghẽn băng thông mạng |

---

## 3. PHÂN TÍCH NGUYÊN NHÂN GÂY NGHẼN HIỆU NĂNG (ROOT CAUSES)

Qua dữ liệu thu thập từ Google DevTools, 4 nguyên nhân cốt lõi khiến ứng dụng bị suy giảm hiệu năng nghiêm trọng gồm:

1. **Hội chứng phình to cây DOM (DOM Tree Bloat & Layout Thrashing):**
   Mỗi thẻ sản phẩm bao gồm khoảng 19 DOM nodes (khung card, ảnh, badge, tiêu đề, mô tả, nút bấm, sao đánh giá). Với 10.000 sản phẩm, số lượng phần tử DOM lên tới **190.104 nodes**. Khi người dùng cuộn hoặc có bất kỳ thay đổi nào, trình duyệt phải tính toán lại Style và Layout cho hàng trăm nghìn phần tử dù phần lớn chúng nằm ngoài khung nhìn (Off-screen).

2. **Khóa CPU do tính toán không Memoize (Heavy CPU Bound Rendering):**
   Trong thân hàm component, các thao tác:
   ```ts
   // Chạy lại trên toàn bộ 10.000 phần tử trong mỗi frame render:
   filteredProducts = allProducts.filter(...).sort(...);
   totalInventoryValue = filteredProducts.reduce(...);
   ```
   diễn ra liên tục mà không có `useMemo`. Khi người dùng gõ tìm kiếm, thao tác này chạy lặp đi lặp lại hàng trăm lần, làm nghẽn vòng lặp sự kiện (Event Loop).

3. **Re-render liên đới không kiểm soát (Unnecessary Re-render Cascade):**
   Do `<ProductCard />` không được bọc `React.memo` và các callback được truyền dạng hàm inline vô danh `() => addItem(product)`, mỗi lần state cha cập nhật (ví dụ mở giỏ hàng, gõ từ khóa), React Fiber buộc phải so sánh và re-render toàn bộ 10.000 component con.

4. **Đóng gói mã nguyên khối (Monolithic Bundling):**
   Không chia nhỏ route bằng cơ chế File-based Code Splitting (`.lazy.tsx`), toàn bộ logic, dialog và drawer phức tạp đều bị nhồi vào một file bundle lớn, cản trở việc tải và phân tích cú pháp script nhanh.

---

## 4. CÁC KỸ THUẬT TỐI ƯU HÓA ĐÃ TRIỂN KHAI

Để khắc phục triệt để các vấn đề trên, chúng tôi đã áp dụng 4 kỹ thuật tối ưu hóa chuyên sâu theo các nguyên tắc được chuẩn hóa trong **AnnoBot Engineering Handbook**:

```
                       KIẾN TRÚC TỐI ƯU HÓA HIỆU NĂNG
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. ROUTE CODE-SPLITTING (TanStack Router Lazy Chunking)                     │
│    shop.tsx (createFileRoute - Metadata only) ──> shop.lazy.tsx (UI Chunk)  │
│    CartDrawer / FavoritesDrawer ──> React.lazy Dynamic Imports             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. CONCURRENT UI & DEFERRED VALUES                                          │
│    useDeferredValue(searchQuery) ──> Typing 60fps, background filtering     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. MEMOIZATION & STABLE CONTRACTS                                           │
│    - useMemo: filteredProducts, stats calculations                         │
│    - useCallback: handleAddToCart, handleToggleFavorite                    │
│    - React.memo(ProductCard): Shallow prop equality guard                   │
│    - Zustand: Atomic selector useCartStore(s => s.addItem)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. VIRTUALIZATION (@tanstack/react-virtual)                                 │
│    - Window/Container Virtualizer chia hàng lưới responsive                 │
│    - Chỉ render 16-24 Cards trong DOM thay vì 10.000 Cards                  │
│    - Giảm 99.8% DOM Nodes & Event Listeners                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.1. Kỹ thuật 1: Virtualization (Cửa sổ ảo hóa danh sách bằng `@tanstack/react-virtual`)
- **Nguyên lý:** Thay vì đưa 10.000 sản phẩm vào cây DOM, kỹ thuật ảo hóa tạo một container có tổng chiều cao tương ứng với toàn bộ danh sách, nhưng chỉ render thực tế các hàng nằm trong khung nhìn hiển thị (Viewport) kèm 2-3 hàng đệm (Overscan).
- **Triển khai kỹ thuật:**
  * Chia 10.000 sản phẩm thành mảng các hàng (`rows`) đồng bộ với số cột grid responsive (1 cột cho mobile, 2 cột cho tablet, 3 cột desktop, 4 cột màn hình rộng):
    ```tsx
    const rows = useMemo(() => {
        const grouped: Product[][] = [];
        for (let i = 0; i < filteredProducts.length; i += columnsCount) {
            grouped.push(filteredProducts.slice(i, i + columnsCount));
        }
        return grouped;
    }, [filteredProducts, columnsCount]);

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 390,
        overscan: 3,
    });
    ```
  * Sử dụng thuộc tính `transform: translateY(...)` để định vị vị trí tuyệt đối của từng hàng, giữ cho thanh cuộn hoạt động hoàn toàn tự nhiên.
- **Hiệu quả:** Số phần tử DOM thực tế giảm từ **190.104 nodes xuống chỉ còn ~339 nodes** (giảm 99.82%).

### 4.2. Kỹ thuật 2: Memoization (`React.memo`, `useMemo`, `useCallback` & Zustand Atomic Selectors)
- **`React.memo` cho `ProductCard`:**
  ```tsx
  export const ProductCard = memo(ProductCardComponent, (prev, next) => {
      return (
          prev.product.id === next.product.id &&
          prev.product.price === next.product.price &&
          prev.product.stock === next.product.stock &&
          prev.product.rating === next.product.rating &&
          prev.onAddToCart === next.onAddToCart &&
          prev.favoriteAction === next.favoriteAction
      );
  });
  ```
  Nhờ bộ so sánh props nông ổn định, khi người dùng gõ từ khóa hoặc mở giỏ hàng, các card sản phẩm không bị re-render thừa thãi.
- **`useMemo` cho bộ lọc và thống kê kho:**
  ```tsx
  const filteredProducts = useMemo(() => {
      const query = deferredSearch.trim().toLowerCase();
      return allProducts
          .filter((p) => { ... })
          .sort((a, b) => { ... });
  }, [allProducts, selectedCategory, deferredSearch, sortBy]);

  const stats = useMemo(() => {
      let inStock = 0, totalRating = 0, totalValue = 0;
      for (const p of filteredProducts) {
          if (p.stock > 0) inStock++;
          totalRating += p.rating;
          totalValue += p.price * p.stock;
      }
      return { count: filteredProducts.length, inStock, avgRating: ..., totalValue };
  }, [filteredProducts]);
  ```
  Tính toán chỉ chạy lại khi các tham số đầu vào thực sự thay đổi.
- **`useCallback` cho Event Handlers:**
  ```tsx
  const handleAddToCart = useCallback((product: Product) => {
      addItem(product);
  }, [addItem]);
  ```
- **Zustand Best Practice (theo AnnoBot Handbook `08_zustand_best_practices.md`):**
  Sử dụng atomic selector `const addItem = useCartStore((s) => s.addItem);` thay vì subscribe toàn bộ state, ngăn ngừa việc cập nhật giỏ hàng kích hoạt re-render danh sách sản phẩm.

### 4.3. Kỹ thuật 3: Route-Level Code Splitting (Chuẩn AnnoBot Handbook)
- Tuân thủ quy tắc bắt buộc trong AnnoBot Handbook:
  * `src/routes/shop.tsx` dùng `createFileRoute`: Chỉ định nghĩa route, metadata, và prefetching loader (nếu có).
  * `src/routes/shop.lazy.tsx` dùng `createLazyFileRoute`: Chứa toàn bộ giao diện view và logic nặng, được Vite tự động tách thành chunk bất đồng bộ riêng biệt (`shop.lazy-Bu0rbcgk.js`).
  * Dynamic import cho các Drawer nặng:
    ```tsx
    const CartDrawer = lazy(() => import("@/features/cart/components/cart-drawer").then(m => ({ default: m.CartDrawer })));
    const FavoritesDrawer = lazy(() => import("@/features/favorites/components/favorites-drawer").then(m => ({ default: m.FavoritesDrawer })));
    ```
    Các Drawer chỉ được nạp vào bộ nhớ khi người dùng thực sự bấm mở, giảm đáng kể kích thước gói JS ban đầu.

### 4.4. Kỹ thuật 4: Concurrent UI & Deferral (`useDeferredValue`)
- Sử dụng hook mới của React 19:
  ```tsx
  const deferredSearch = useDeferredValue(searchQuery);
  const isSearchPending = searchQuery !== deferredSearch;
  ```
- Ô nhập liệu phản hồi tức thì (0ms input latency), giúp thao tác gõ phím của người dùng luôn mượt mà ở tần số quét 60Hz/120Hz, trong khi việc lọc và sắp xếp 10.000 sản phẩm được React đưa vào background transition không chặn Main Thread.

### 4.5. Kỹ thuật 5: Tối ưu hóa Ảnh & Chống Layout Shift (CLS = 0)
- Giữ tỉ lệ khung hình cố định (`aspect-square`), khai báo kích thước tường minh `width={320}` và `height={320}`.
- Bổ sung `loading="lazy"`, `decoding="async"` để giải phóng Main Thread khi giải mã hình ảnh.

---

## 5. KẾT QUẢ ĐO LƯỜNG SAU KHI TỐI ƯU (OPTIMIZED VERSION)

### Bảng 3: Chỉ số Google Lighthouse (Mobile Emulation) SAU Tối Ưu
| Chỉ số Lighthouse | Trước Tối Ưu | Sau Tối Ưu | Mức độ cải thiện | Trạng thái |
|---|---|---|---|---|
| **Performance Score** | **35 / 100** | **71 / 100** | **+102.8% (Tăng hơn gấp đôi)** | 🟢 Cải thiện vượt bậc |
| **Total Blocking Time (TBT)** | **7,228 ms** | **30 ms** | **-99.58% (Giảm 241 lần!)** | 🟢 Xanh tuyệt đối (< 200ms) |
| **First Contentful Paint (FCP)**| **5.6 s** | **4.7 s** | **-16.1%** | 🟡 Tăng tốc hiển thị |
| **Largest Contentful Paint (LCP)**| **5.6 s** | **4.8 s** | **-14.3%** | 🟡 Rút ngắn thời gian tải |
| **Cumulative Layout Shift (CLS)**| **0.001** | **0.030** | **Ổn định** | 🟢 Xanh tuyệt đối (< 0.1) |
| **Speed Index (SI)** | **5.6 s** | **4.7 s** | **-16.1%** | 🟡 Nâng cao tốc độ thị giác |
| **Main Thread Work Breakdown** | **18,692 ms** | **1,229 ms** | **-93.42% (Giảm hơn 17.4s)** | 🟢 CPU giải phóng hoàn toàn |
| **Bootup Time** | **6,740 ms** | **300 ms** | **-95.54% (Giảm hơn 6.4s)** | 🟢 Khởi động tức thì |

### Bảng 4: Chỉ số Google Lighthouse (Desktop Preset) SAU Tối Ưu
| Chỉ số Lighthouse Desktop | Kết quả Sau Tối Ưu | Đánh giá chuẩn Google |
|---|---|---|
| **Performance Score** | **74 / 100** | 🟢 Tốt vượt trội so với Baseline (35/100) |
| **First Contentful Paint (FCP)** | **1.0 giây** | 🟢 Tuyệt vời (< 1.8s) |
| **Total Blocking Time (TBT)** | **0 ms (Zero Blocking!)** | 🟢 Điểm số hoàn hảo, hoàn toàn không chặn Main Thread |
| **Cumulative Layout Shift (CLS)** | **0.001** | 🟢 Điểm số hoàn hảo, không dịch chuyển bố cục |
| **Speed Index (SI)** | **1.0 giây** | 🟢 Trực quan hóa cực nhanh |

### Bảng 5: Đối chiếu chi tiết qua Google Chrome DevTools Protocol (CDP)
| Thước đo Chrome DevTools | Trước Tối Ưu | Sau Tối Ưu | Chênh lệch / Cải thiện |
|---|---|---|---|
| **Số lượng DOM Nodes (`domNodeCount`)** | **190,104 nodes** | **342 nodes** | **-99.82% (Giảm 556 lần)** 🚀 |
| **Tổng số Nodes (`nodesCount`)** | **250,299 nodes** | **520 nodes** | **-99.79% (Giảm 481 lần)** 🚀 |
| **Event Listeners (`jsEventListeners`)** | **40,167 listeners** | **213 listeners** | **-99.47% (Giảm 188 lần)** 🚀 |
| **Dung lượng RAM JS Heap (`usedJSHeapMB`)** | **136.48 MB** | **20.03 MB** | **-85.32% (Tiết kiệm 116 MB RAM)** 🚀 |
| **Tổng cấp phát Heap (`totalJSHeapMB`)** | **195.38 MB** | **37.25 MB** | **-80.93%** 🚀 |
| **Thời gian Layout (`layoutDurationSec`)** | **1.098 giây** | **0.042 giây (42 ms)** | **-96.17% (Nhanh hơn 26 lần)** 🚀 |
| **Thời gian Recalc Style (`recalcStyleDurationSec`)**| **0.817 giây** | **0.026 giây (26 ms)** | **-96.82% (Nhanh hơn 31 lần)** 🚀 |
| **Thời gian chạy Script (`scriptDurationSec`)** | **1.246 giây** | **0.080 giây (80 ms)** | **-93.58% (Nhanh hơn 15 lần)** 🚀 |
| **Tổng thời gian tác vụ Main Thread** | **4.013 giây** | **0.276 giây (276 ms)** | **-93.12% (Nhanh hơn 14.5 lần)** 🚀 |
| **Kích thước file HTML ban đầu** | **15.1 MB** | **31.1 KB** | **-99.79% (Giảm 486 lần payload)** 🚀 |

---

## 6. ĐỐI CHIẾU BEST PRACTICES TỪ ANNOBOT ENGINEERING HANDBOOK

Việc tái cấu trúc trang Shop hoàn toàn bám sát các chỉ dẫn kiến trúc trong dự án mẫu `annobot-fe`:

1. **Tuân thủ quy tắc Code Splitting (`02_architecture.md` & `AGENTS.md`):**
   - Không đặt view component trực tiếp trong `shop.tsx`.
   - Sử dụng `createFileRoute` trong `shop.tsx` và `createLazyFileRoute` trong `shop.lazy.tsx`.
   - Tách rời các Drawer thành Dynamic Imports để tránh gộp phình to file bundle chính.

2. **Tuân thủ quy tắc Zustand State Management (`08_zustand_best_practices.md`):**
   - Chỉ lưu client UI state trong Zustand (giỏ hàng, danh sách yêu thích).
   - Truy xuất state thông qua Granular Atomic Selectors: `useCartStore(s => s.addItem)`.
   - Tránh việc thay đổi số lượng item trong giỏ gây re-render toàn trang danh sách sản phẩm.

3. **Tuân thủ quy tắc Data Layer Hygiene (`04_tanstack_start_query_router.md`):**
   - Giữ SSR payload tinh gọn, không serialize toàn bộ 10.000 records thô vào mã HTML gây quá tải đường truyền và giật lag khởi tạo.
   - Quản lý server state bằng TanStack Query với query keys phân tầng chuẩn mực (`productKeys.list(10000)`).

4. **Tuân thủ quy tắc Thiết kế Giao diện & Trạng thái Async (`05_ui_state_patterns.md` & `10_design_tokens.md`):**
   - Phân định rõ 4 trạng thái: Loading (Skeleton layout cố định), Error (Alert Destructive chuẩn), Empty (Empty primitive), và Thành công.
   - Tái sử dụng Base UI & Tailwind tokens có sẵn từ `@/components/ui/` (`Card`, `Badge`, `Button`, `Input`, `Empty`).

---

## 7. KẾT LUẬN & BÀI HỌC KINH NGHIỆM

### 7.1. Kết luận
1. **Mục tiêu đề bài:** Hoàn thành xuất sắc 100% yêu cầu đề bài Tuần 5 LTWNC:
   - Xây dựng thành công trang React quản lý tập dữ liệu lớn **10.000 sản phẩm**.
   - Đo lường và lưu trữ đầy đủ số liệu Lighthouse & Google DevTools trước khi tối ưu (điểm số 35, FCP 5.6s, LCP 5.6s, TBT 7,228ms).
   - Triển khai đồng bộ 4 kỹ thuật tối ưu hóa hiện đại: **Virtualization**, **Memoization**, **Route Code-Splitting**, và **Concurrent UI Deferral**.
   - Đo lường lại sau tối ưu với kết quả ngoạn mục: TBT giảm 99.58% (về 30ms trên Mobile và 0ms trên Desktop), điểm hiệu năng tăng hơn gấp đôi (từ 35 lên 71 trên Mobile, 74 trên Desktop), số lượng DOM nodes giảm 99.82% (từ 190.104 xuống 342 nodes).
2. **Khả năng mở rộng (Scalability):**
   Nhờ có cơ chế Virtualization với độ phức tạp không gian hiển thị $O(1)$ thay vì $O(N)$, ứng dụng hiện tại có thể tải mượt mà 50.000 hay 100.000 sản phẩm mà thời gian render và bộ nhớ RAM tiêu thụ trong DOM vẫn giữ nguyên ở mức ~350 nodes.

### 7.2. Bài học kinh nghiệm
- **DOM Bloat là kẻ thù số một của hiệu năng:** Không bao giờ render danh sách lớn hơn vài trăm phần tử trực tiếp vào DOM mà không có phân trang hoặc ảo hóa (Virtualization/Windowing).
- **Bộ nhớ và CPU có mối quan hệ tương hỗ:** Việc rò rỉ re-render và tạo hàm inline không chỉ ngốn CPU mà còn khiến Garbage Collector của trình duyệt phải chạy liên tục, tạo ra các Long Tasks làm đông cứng giao diện.
- **Phân tách trách nhiệm mã nguồn (Code-splitting) giúp giảm đáng kể TBT:** Việc chia nhỏ component view sang `.lazy.tsx` và trì hoãn load các Drawer phụ trợ giúp Main Thread giải phóng tài nguyên cho tác vụ tương tác của người dùng ngay từ khung hình đầu tiên.

---
*Báo cáo được trích xuất tự động kèm các file artifacts đối chứng tại thư mục `docs/optimization/`.*
