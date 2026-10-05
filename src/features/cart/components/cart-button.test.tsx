import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Product } from "@/features/products";
import { useCartStore } from "../store";
import { CartButton } from "./cart-button";

const mockProduct: Product = {
	id: 1,
	title: "Mechanical Keyboard",
	description: "RGB Mechanical Keyboard",
	category: "electronics",
	price: 99,
	discountPercentage: 0,
	rating: 4.5,
	stock: 10,
	brand: "Keychron",
	thumbnail: "https://example.com/thumb.jpg",
	images: [],
};

describe("CartButton Component (RTL Integration Tests)", () => {
	beforeEach(() => {
		useCartStore.getState().clearCart();
	});

	it("renders cart button without badge when cart is empty", () => {
		const onOpen = vi.fn();
		render(<CartButton onOpen={onOpen} />);

		const button = screen.getByRole("button", { name: /open cart/i });
		expect(button).toBeInTheDocument();
		expect(screen.queryByText(/^[0-9]+$/)).not.toBeInTheDocument();
	});

	it("renders badge with total item count when cart contains items", () => {
		useCartStore.getState().addItem(mockProduct, 3);

		render(<CartButton onOpen={vi.fn()} />);

		const badge = screen.getByText("3");
		expect(badge).toBeInTheDocument();
	});

	it("calls onOpen callback when user clicks cart button", () => {
		const onOpen = vi.fn();
		render(<CartButton onOpen={onOpen} />);

		const button = screen.getByRole("button", { name: /open cart/i });
		fireEvent.click(button);

		expect(onOpen).toHaveBeenCalledTimes(1);
	});
});
