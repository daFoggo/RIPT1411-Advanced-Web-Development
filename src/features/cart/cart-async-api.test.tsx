import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as productFunctions from "@/features/products/functions";
import { productsQueryOptions } from "@/features/products/queries";
import type { Product, ProductListResponse } from "@/features/products/schemas";
import { selectCartCount, selectCartTotal, useCartStore } from "./store";

// Mock the product server functions module to simulate async HTTP API responses
vi.mock("@/features/products/functions", () => ({
	getProductsFn: vi.fn(),
}));

const mockedFunctions = vi.mocked(productFunctions);

const mockApiProducts: Product[] = [
	{
		id: 201,
		title: "Wireless Gaming Mouse",
		description: "High precision wireless sensor",
		category: "gaming",
		price: 75,
		discountPercentage: 10,
		rating: 4.7,
		stock: 8,
		brand: "Razer",
		thumbnail: "https://example.com/mouse.jpg",
		images: [],
	},
	{
		id: 202,
		title: "Mechanical Numpad",
		description: "Hot-swappable standalone numeric keypad",
		category: "accessories",
		price: 45,
		discountPercentage: 0,
		rating: 4.4,
		stock: 5,
		brand: "Keychron",
		thumbnail: "https://example.com/numpad.jpg",
		images: [],
	},
];

const mockApiResponse: ProductListResponse = {
	products: mockApiProducts,
	total: 2,
	skip: 0,
	limit: 2,
};

// Component using TanStack Query and Zustand Cart Store
function AsyncShopView() {
	const { data, isLoading, isError, error } = useQuery(productsQueryOptions(2));
	const addItem = useCartStore((s) => s.addItem);
	const count = useCartStore(selectCartCount);
	const total = useCartStore(selectCartTotal);

	if (isLoading) {
		return <div data-testid="loading-indicator">Loading products from API...</div>;
	}

	if (isError) {
		return (
			<div data-testid="error-message" role="alert">
				Failed to load products: {(error as Error).message}
			</div>
		);
	}

	return (
		<div>
			<div data-testid="cart-summary">
				Items in cart: <span data-testid="cart-count">{count}</span> | Total:{" "}
				<span data-testid="cart-total">${total}</span>
			</div>

			<ul data-testid="product-list">
				{data?.products.map((product) => (
					<li key={product.id}>
						<span>{product.title}</span> - ${product.price}
						<button
							type="button"
							onClick={() => addItem(product)}
							aria-label={`Add ${product.title} to cart`}
						>
							Add to cart
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

const renderWithQueryClient = (ui: ReactNode) => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
	);
};

describe("Cart & Product Async API Integration Tests", () => {
	beforeEach(() => {
		useCartStore.getState().clearCart();
		vi.clearAllMocks();
	});

	it("fetches products asynchronously from mocked API and adds product to cart on user interaction", async () => {
		// Mock API resolves with delayed Promise
		mockedFunctions.getProductsFn.mockImplementation(
			() =>
				new Promise<ProductListResponse>((resolve) => {
					setTimeout(() => resolve(mockApiResponse), 50);
				}),
		);

		renderWithQueryClient(<AsyncShopView />);

		// 1. Verify loading state is displayed while async API request is in-flight
		expect(
			screen.getByTestId("loading-indicator"),
		).toHaveTextContent("Loading products from API...");

		// 2. Wait for async API to resolve and check rendered products
		await waitFor(() => {
			expect(screen.getByText("Wireless Gaming Mouse")).toBeInTheDocument();
		});
		expect(screen.getByText("Mechanical Numpad")).toBeInTheDocument();
		expect(screen.getByTestId("cart-count")).toHaveTextContent("0");

		// 3. User interacts with UI to add product to cart
		const addBtn = screen.getByRole("button", {
			name: /add wireless gaming mouse to cart/i,
		});
		fireEvent.click(addBtn);

		// 4. Verify cart state is synchronously updated via Zustand store
		expect(screen.getByTestId("cart-count")).toHaveTextContent("1");
		expect(screen.getByTestId("cart-total")).toHaveTextContent("$75");

		const storeItems = useCartStore.getState().items;
		expect(storeItems).toHaveLength(1);
		expect(storeItems[0].product.id).toBe(201);
		expect(storeItems[0].quantity).toBe(1);
	});

	it("handles asynchronous API error gracefully when server request fails", async () => {
		// Mock API returns rejected Promise
		mockedFunctions.getProductsFn.mockRejectedValueOnce(
			new Error("Internal Server Error (500)"),
		);

		renderWithQueryClient(<AsyncShopView />);

		// Initially loading
		expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();

		// Wait for error state
		await waitFor(() => {
			expect(screen.getByTestId("error-message")).toBeInTheDocument();
		});

		expect(screen.getByTestId("error-message")).toHaveTextContent(
			"Failed to load products: Internal Server Error (500)",
		);
		// Cart remains unaffected
		expect(useCartStore.getState().items).toHaveLength(0);
	});

	it("asynchronously processes mock checkout API and clears cart on successful order", async () => {
		// Pre-populate cart
		useCartStore.getState().addItem(mockApiProducts[0], 2);
		expect(useCartStore.getState().items).toHaveLength(1);

		// Mock async checkout API endpoint
		const mockCheckoutApi = vi.fn().mockImplementation(async (items) => {
			await new Promise((r) => setTimeout(r, 30));
			return {
				success: true,
				orderId: "ORDER-78901",
				totalCharged: items.reduce(
					(acc: number, item: any) => acc + item.product.price * item.quantity,
					0,
				),
			};
		});

		const currentItems = useCartStore.getState().items;
		const checkoutResult = await mockCheckoutApi(currentItems);

		expect(mockCheckoutApi).toHaveBeenCalledWith(currentItems);
		expect(checkoutResult.success).toBe(true);
		expect(checkoutResult.orderId).toBe("ORDER-78901");
		expect(checkoutResult.totalCharged).toBe(150);

		// Post-checkout: clear cart
		useCartStore.getState().clearCart();
		expect(useCartStore.getState().items).toHaveLength(0);
		expect(selectCartCount(useCartStore.getState())).toBe(0);
	});
});
