import { create } from "zustand";

import type { Product } from "@/features/products";

export interface CartItem {
	product: Product;
	quantity: number;
}

interface CartState {
	items: CartItem[];
}

interface CartActions {
	addItem: (product: Product, quantity?: number) => void;
	removeItem: (productId: number) => void;
	updateQuantity: (productId: number, quantity: number) => void;
	clearCart: () => void;
}

/**
 * Đây là client state thuần (giỏ hàng là trạng thái tạm thời của phiên làm việc),
 * nên nó thuộc Zustand, không phải TanStack Query. Server data của sản phẩm vẫn
 * do TanStack Query sở hữu; mỗi item trong giỏ chỉ lưu một snapshot của product
 * kèm số lượng để cart render độc lập không cần query lại.
 */
export const useCartStore = create<CartState & CartActions>()((set) => ({
	items: [],

	addItem: (product, quantity = 1) =>
		set((state) => {
			const existing = state.items.find(
				(item) => item.product.id === product.id,
			);
			if (existing) {
				return {
					items: state.items.map((item) =>
						item.product.id === product.id
							? {
									...item,
									quantity: Math.min(item.quantity + quantity, product.stock),
								}
							: item,
					),
				};
			}
			return {
				items: [
					...state.items,
					{ product, quantity: Math.min(quantity, product.stock) },
				],
			};
		}),

	removeItem: (productId) =>
		set((state) => ({
			items: state.items.filter((item) => item.product.id !== productId),
		})),

	updateQuantity: (productId, quantity) =>
		set((state) => ({
			items:
				quantity <= 0
					? state.items.filter((item) => item.product.id !== productId)
					: state.items.map((item) =>
							item.product.id === productId
								? {
										...item,
										quantity: Math.min(quantity, item.product.stock),
									}
								: item,
						),
		})),

	clearCart: () => set({ items: [] }),
}));

// --- Atomic selectors: dùng để tránh re-render không cần thiết ---

export const selectCartItems = (state: CartState) => state.items;

export const selectCartCount = (state: CartState) =>
	state.items.reduce((count, item) => count + item.quantity, 0);

export const selectCartTotal = (state: CartState) =>
	state.items.reduce(
		(total, item) => total + item.product.price * item.quantity,
		0,
	);

export const selectCartSubtotal = selectCartTotal;
