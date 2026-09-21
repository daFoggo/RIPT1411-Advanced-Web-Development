import "@tanstack/react-start/server-only";

import ky from "ky";

import { ProductListResponseSchema } from "./schemas";
import type { ProductListResponse } from "./schemas";

const DUMMYJSON_BASE_URL = "https://dummyjson.com";

const PRODUCT_FIELDS =
	"id,title,description,category,price,discountPercentage,rating,stock,brand,thumbnail,images";

/**
 * Instance ky riêng cho DummyJSON.
 * Không dùng chung `api` từ `@/lib/ky` vì instance đó gắn prefix + Bearer auth
 * của HTTP backend; DummyJSON là API demo ngoài nên có instance riêng.
 */
const dummyJsonApi = ky.create({
	prefix: DUMMYJSON_BASE_URL,
	timeout: 30000,
});

/**
 * Gọi DummyJSON API lấy danh sách sản phẩm, validate payload bằng Zod rồi
 * trả về `data.products` đã được kiểm tra.
 */
export const getProducts = async (limit = 12): Promise<ProductListResponse> => {
	const response = await dummyJsonApi
		.get(`products?limit=${limit}&select=${PRODUCT_FIELDS}`)
		.json();

	const parsed = ProductListResponseSchema.safeParse(response);
	if (!parsed.success) {
		throw new Error("DummyJSON returned an unexpected products payload");
	}

	return parsed.data;
};
