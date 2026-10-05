import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Product } from "@/features/products";
import { useCartStore } from "../store";
import { CartDrawer } from "./cart-drawer";

const mockProductA: Product = {
	id: 11,
	title: "Mechanical Keyboard",
	description: "RGB Mechanical Keyboard",
	category: "electronics",
	price: 150,
	discountPercentage: 0,
	rating: 4.8,
	stock: 5,
	brand: "Keychron",
	thumbnail: "https://example.com/kb.jpg",
	images: [],
};

const mockProductB: Product = {
	id: 12,
	title: "Wireless Mouse",
	description: "Ergonomic mouse",
	category: "electronics",
	price: 50,
	discountPercentage: 0,
	rating: 4.5,
	stock: 5,
	brand: "Logitech",
	thumbnail: "https://example.com/mouse.jpg",
	images: [],
};

describe("CartDrawer Component (RTL Integration Tests)", () => {
	beforeEach(() => {
		useCartStore.getState().clearCart();
	});

	it("renders empty state when cart has no items", () => {
		render(<CartDrawer open={true} onOpenChange={vi.fn()} />);

		expect(screen.getByText("Your cart")).toBeInTheDocument();
		expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
		expect(screen.getByText("No items yet")).toBeInTheDocument();
		expect(
			screen.getByText("Browse the shop and add products to your cart."),
		).toBeInTheDocument();

		const clearBtn = screen.getByRole("button", { name: /clear cart/i });
		expect(clearBtn).toBeDisabled();
	});

	it("renders items list, count, and subtotal when cart contains items", () => {
		useCartStore.getState().addItem(mockProductA, 2);
		useCartStore.getState().addItem(mockProductB, 1);

		render(<CartDrawer open={true} onOpenChange={vi.fn()} />);

		expect(screen.getByText("3 items in your cart")).toBeInTheDocument();
		expect(screen.getByText("Mechanical Keyboard")).toBeInTheDocument();
		expect(screen.getByText("Wireless Mouse")).toBeInTheDocument();
		expect(screen.getByText("Subtotal")).toBeInTheDocument();

		const clearBtn = screen.getByRole("button", { name: /clear cart/i });
		expect(clearBtn).not.toBeDisabled();
	});

	it("clears all items in the cart when user clicks 'Clear cart'", () => {
		useCartStore.getState().addItem(mockProductA, 1);

		render(<CartDrawer open={true} onOpenChange={vi.fn()} />);

		const clearBtn = screen.getByRole("button", { name: /clear cart/i });
		expect(clearBtn).not.toBeDisabled();

		fireEvent.click(clearBtn);

		expect(useCartStore.getState().items).toHaveLength(0);
		expect(screen.getByText("No items yet")).toBeInTheDocument();
	});

	it("does not render drawer content when open is false", () => {
		render(<CartDrawer open={false} onOpenChange={vi.fn()} />);

		expect(screen.queryByText("Your cart")).not.toBeInTheDocument();
	});
});
