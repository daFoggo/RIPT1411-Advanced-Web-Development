import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { Product } from "@/features/products";
import type { CartItem } from "../store";
import { useCartStore } from "../store";
import { CartItemRow } from "./cart-item-row";

const mockProduct: Product = {
	id: 42,
	title: "Noise Cancelling Headphones",
	description: "Premium over-ear wireless headphones",
	category: "audio",
	price: 250,
	discountPercentage: 0,
	rating: 4.9,
	stock: 4,
	brand: "Sony",
	thumbnail: "https://example.com/headphones.jpg",
	images: [],
};

describe("CartItemRow Component (RTL Integration Tests)", () => {
	beforeEach(() => {
		useCartStore.getState().clearCart();
	});

	it("renders item thumbnail, title, price breakdown and current quantity", () => {
		const item: CartItem = { product: mockProduct, quantity: 2 };
		useCartStore.getState().addItem(mockProduct, 2);

		render(<CartItemRow item={item} />);

		expect(
			screen.getByText("Noise Cancelling Headphones"),
		).toBeInTheDocument();
		const image = screen.getByAltText("Noise Cancelling Headphones");
		expect(image).toHaveAttribute("src", "https://example.com/headphones.jpg");

		// Quantity display
		expect(screen.getByText("2")).toBeInTheDocument();
	});

	it("increments quantity when clicking the plus button", () => {
		const item: CartItem = { product: mockProduct, quantity: 2 };
		useCartStore.getState().addItem(mockProduct, 2);

		render(<CartItemRow item={item} />);

		const plusBtn = screen.getByRole("button", { name: /increase quantity/i });
		expect(plusBtn).not.toBeDisabled();

		fireEvent.click(plusBtn);

		const updatedItem = useCartStore.getState().items.find((i) => i.product.id === 42);
		expect(updatedItem?.quantity).toBe(3);
	});

	it("disables the plus button when quantity reaches product stock limit", () => {
		const item: CartItem = { product: mockProduct, quantity: 4 }; // stock is 4
		useCartStore.getState().addItem(mockProduct, 4);

		render(<CartItemRow item={item} />);

		const plusBtn = screen.getByRole("button", { name: /increase quantity/i });
		expect(plusBtn).toBeDisabled();
	});

	it("decrements quantity when clicking the minus button", () => {
		const item: CartItem = { product: mockProduct, quantity: 3 };
		useCartStore.getState().addItem(mockProduct, 3);

		render(<CartItemRow item={item} />);

		const minusBtn = screen.getByRole("button", {
			name: /decrease quantity/i,
		});
		expect(minusBtn).not.toBeDisabled();

		fireEvent.click(minusBtn);

		const updatedItem = useCartStore.getState().items.find((i) => i.product.id === 42);
		expect(updatedItem?.quantity).toBe(2);
	});

	it("disables the minus button when quantity is 1", () => {
		const item: CartItem = { product: mockProduct, quantity: 1 };
		useCartStore.getState().addItem(mockProduct, 1);

		render(<CartItemRow item={item} />);

		const minusBtn = screen.getByRole("button", {
			name: /decrease quantity/i,
		});
		expect(minusBtn).toBeDisabled();
	});

	it("removes product from store when clicking remove button", () => {
		const item: CartItem = { product: mockProduct, quantity: 2 };
		useCartStore.getState().addItem(mockProduct, 2);

		render(<CartItemRow item={item} />);

		const deleteBtn = screen.getByRole("button", {
			name: /remove noise cancelling headphones from cart/i,
		});
		fireEvent.click(deleteBtn);

		expect(useCartStore.getState().items).toHaveLength(0);
	});
});
