import { beforeEach, describe, expect, it } from "vitest";

import type { Product } from "@/features/products";
import {
	selectCartCount,
	selectCartItems,
	selectCartSubtotal,
	selectCartTotal,
	useCartStore,
} from "./store";

const mockProductA: Product = {
	id: 101,
	title: "Wireless Mechanical Keyboard",
	description: "Compact wireless RGB keyboard with hot-swappable switches",
	category: "electronics",
	price: 120,
	discountPercentage: 10,
	rating: 4.8,
	stock: 5,
	brand: "Keychron",
	thumbnail: "https://example.com/kb.jpg",
	images: ["https://example.com/kb.jpg"],
};

const mockProductB: Product = {
	id: 102,
	title: "Ergonomic Optical Mouse",
	description: "Precision wireless mouse with ultra-low latency sensor",
	category: "electronics",
	price: 80,
	discountPercentage: 5,
	rating: 4.6,
	stock: 3,
	brand: "Logitech",
	thumbnail: "https://example.com/mouse.jpg",
	images: ["https://example.com/mouse.jpg"],
};

describe("Cart Store (Zustand Unit Tests)", () => {
	beforeEach(() => {
		useCartStore.getState().clearCart();
	});

	it("should initialize with an empty item list and zero count/total", () => {
		const state = useCartStore.getState();
		expect(state.items).toEqual([]);
		expect(selectCartCount(state)).toBe(0);
		expect(selectCartTotal(state)).toBe(0);
		expect(selectCartSubtotal(state)).toBe(0);
	});

	it("should add a new product with default quantity of 1", () => {
		useCartStore.getState().addItem(mockProductA);

		const state = useCartStore.getState();
		expect(state.items).toHaveLength(1);
		expect(state.items[0]).toEqual({
			product: mockProductA,
			quantity: 1,
		});
		expect(selectCartCount(state)).toBe(1);
		expect(selectCartTotal(state)).toBe(120);
	});

	it("should add a new product with specified quantity", () => {
		useCartStore.getState().addItem(mockProductA, 3);

		const state = useCartStore.getState();
		expect(state.items).toHaveLength(1);
		expect(state.items[0].quantity).toBe(3);
		expect(selectCartTotal(state)).toBe(360);
	});

	it("should increment quantity when adding an already existing product", () => {
		useCartStore.getState().addItem(mockProductA, 1);
		useCartStore.getState().addItem(mockProductA, 2);

		const state = useCartStore.getState();
		expect(state.items).toHaveLength(1);
		expect(state.items[0].quantity).toBe(3);
		expect(selectCartCount(state)).toBe(3);
	});

	it("should cap quantity to available product.stock when adding exceeds stock", () => {
		// mockProductA stock is 5
		useCartStore.getState().addItem(mockProductA, 4);
		useCartStore.getState().addItem(mockProductA, 10); // Total would be 14, but stock is 5

		const state = useCartStore.getState();
		expect(state.items[0].quantity).toBe(5);
	});

	it("should support adding multiple distinct products to cart", () => {
		useCartStore.getState().addItem(mockProductA, 2);
		useCartStore.getState().addItem(mockProductB, 1);

		const state = useCartStore.getState();
		expect(state.items).toHaveLength(2);
		expect(selectCartCount(state)).toBe(3);
		// 120 * 2 + 80 * 1 = 320
		expect(selectCartTotal(state)).toBe(320);
	});

	it("should remove product by productId", () => {
		useCartStore.getState().addItem(mockProductA, 1);
		useCartStore.getState().addItem(mockProductB, 2);

		useCartStore.getState().removeItem(mockProductA.id);

		const state = useCartStore.getState();
		expect(state.items).toHaveLength(1);
		expect(state.items[0].product.id).toBe(mockProductB.id);
		expect(selectCartCount(state)).toBe(2);
		expect(selectCartTotal(state)).toBe(160);
	});

	it("should update quantity of an item within valid stock limits", () => {
		useCartStore.getState().addItem(mockProductA, 1);

		useCartStore.getState().updateQuantity(mockProductA.id, 4);

		const state = useCartStore.getState();
		expect(state.items[0].quantity).toBe(4);
		expect(selectCartTotal(state)).toBe(480);
	});

	it("should cap updated quantity at product.stock if requested quantity is higher", () => {
		useCartStore.getState().addItem(mockProductA, 1);

		useCartStore.getState().updateQuantity(mockProductA.id, 999);

		const state = useCartStore.getState();
		expect(state.items[0].quantity).toBe(mockProductA.stock);
	});

	it("should remove item when quantity is updated to 0 or negative", () => {
		useCartStore.getState().addItem(mockProductA, 2);

		useCartStore.getState().updateQuantity(mockProductA.id, 0);

		const state = useCartStore.getState();
		expect(state.items).toHaveLength(0);
		expect(selectCartCount(state)).toBe(0);
	});

	it("should clear all items in the cart", () => {
		useCartStore.getState().addItem(mockProductA, 2);
		useCartStore.getState().addItem(mockProductB, 1);

		useCartStore.getState().clearCart();

		const state = useCartStore.getState();
		expect(state.items).toEqual([]);
		expect(selectCartItems(state)).toEqual([]);
		expect(selectCartCount(state)).toBe(0);
		expect(selectCartTotal(state)).toBe(0);
	});

	it("preserves untouched items unchanged when incrementing or updating another item", () => {
		useCartStore.getState().addItem(mockProductA, 1);
		useCartStore.getState().addItem(mockProductB, 2);

		// Increment productA - productB should remain untouched (branch : item)
		useCartStore.getState().addItem(mockProductA, 1);
		let state = useCartStore.getState();
		expect(state.items.find((i) => i.product.id === mockProductB.id)?.quantity).toBe(2);

		// Update productA - productB should remain untouched (branch : item)
		useCartStore.getState().updateQuantity(mockProductA.id, 4);
		state = useCartStore.getState();
		expect(state.items.find((i) => i.product.id === mockProductB.id)?.quantity).toBe(2);
	});
});
