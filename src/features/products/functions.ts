import { createServerFn } from "@tanstack/react-start";

import { getProducts } from "./server";

/**
 * Server function lấy danh sách sản phẩm từ DummyJSON.
 * Chạy phía server (SSR-friendly), client chỉ nhận data đã validate.
 */
export const getProductsFn = createServerFn({ method: "GET" })
	.validator((limit?: number) => limit ?? 10000)
	.handler(async ({ data: limit }) => getProducts(limit));
