import { createServerFn } from "@tanstack/react-start";

import { getProducts } from "./server";

/**
 * Server function lấy danh sách sản phẩm từ DummyJSON.
 * Chạy phía server (SSR-friendly), client chỉ nhận data đã validate.
 */
export const getProductsFn = createServerFn({ method: "GET" }).handler(
	async () => getProducts(),
);
