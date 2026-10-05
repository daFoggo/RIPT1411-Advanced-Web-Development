import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as functions from "./functions";
import { productKeys, productsQueryOptions } from "./queries";
import type { ProductListResponse } from "./schemas";

vi.mock("./functions", () => ({
	getProductsFn: vi.fn(),
}));

const mockedFunctions = vi.mocked(functions);

const mockApiResponse: ProductListResponse = {
	products: [
		{
			id: 1,
			title: "Mocked Laptop Pro",
			description: "Ultra-fast developer laptop",
			category: "laptops",
			price: 1500,
			discountPercentage: 5,
			rating: 4.9,
			stock: 12,
			brand: "Apple",
			thumbnail: "https://example.com/laptop.jpg",
			images: [],
		},
	],
	total: 1,
	skip: 0,
	limit: 10,
};

const createTestWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

	const Wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	return { queryClient, Wrapper };
};

describe("Products Queries (Async API Mocking Tests)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should have consistent query key hierarchy", () => {
		expect(productKeys.all).toEqual(["products"]);
		expect(productKeys.lists()).toEqual(["products", "list"]);
		expect(productKeys.list(50)).toEqual(["products", "list", { limit: 50 }]);
	});

	it("fetches product list asynchronously with mocked API and resolves data", async () => {
		mockedFunctions.getProductsFn.mockResolvedValueOnce(mockApiResponse);

		const { queryClient } = createTestWrapper();
		const options = productsQueryOptions(10);

		const result = await queryClient.fetchQuery(options);

		expect(mockedFunctions.getProductsFn).toHaveBeenCalledTimes(1);
		expect(mockedFunctions.getProductsFn).toHaveBeenCalledWith({ data: 10 });
		expect(result).toEqual(mockApiResponse);
		expect(result.products).toHaveLength(1);
		expect(result.products[0].title).toBe("Mocked Laptop Pro");
	});

	it("handles asynchronous API rejection and transitions query into error state", async () => {
		const apiError = new Error("Network timeout: Failed to fetch products");
		mockedFunctions.getProductsFn.mockRejectedValueOnce(apiError);

		const { Wrapper } = createTestWrapper();

		const { result } = renderHook(() => useQuery(productsQueryOptions(10)), {
			wrapper: Wrapper,
		});

		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error).toEqual(apiError);
	});
});
