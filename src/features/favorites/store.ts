import { create } from "zustand";

import type { Product } from "@/features/products";

export interface FavoriteItem {
	product: Product;
}

interface FavoriteState {
	items: FavoriteItem[];
}

interface FavoriteActions {
	addFavorite: (product: Product) => void;
	removeFavorite: (productId: number) => void;
	toggleFavorite: (product: Product) => void;
	clearFavorites: () => void;
}

/**
 * Danh sách yêu thích là client state thuần (user thích/bỏ thích trong phiên),
 * nên thuộc Zustand, không phải TanStack Query. Server data của sản phẩm vẫn do
 * TanStack Query sở hữu; mỗi item chỉ lưu snapshot của product để danh sách
 * render độc lập không cần query lại (giống cách cart feature làm).
 */
export const useFavoritesStore = create<FavoriteState & FavoriteActions>()(
	(set) => ({
		items: [],

		addFavorite: (product) =>
			set((state) =>
				state.items.some((item) => item.product.id === product.id)
					? {}
					: { items: [...state.items, { product }] },
			),

		removeFavorite: (productId) =>
			set((state) => ({
				items: state.items.filter((item) => item.product.id !== productId),
			})),

		toggleFavorite: (product) =>
			set((state) =>
				state.items.some((item) => item.product.id === product.id)
					? {
							items: state.items.filter(
								(item) => item.product.id !== product.id,
							),
						}
					: { items: [...state.items, { product }] },
			),

		clearFavorites: () => set({ items: [] }),
	}),
);

// --- Atomic selectors: dùng để tránh re-render không cần thiết ---

export const selectFavoriteItems = (state: FavoriteState) => state.items;

export const selectFavoriteCount = (state: FavoriteState) => state.items.length;

export const selectFavoriteIds = (state: FavoriteState) =>
	state.items.map((item) => item.product.id);

/** Selector factory: kiểm tra 1 sản phẩm có trong danh sách yêu thích hay không. */
export const selectIsFavorite = (productId: number) => (state: FavoriteState) =>
	state.items.some((item) => item.product.id === productId);
