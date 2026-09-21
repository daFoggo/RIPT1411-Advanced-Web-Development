import { z } from "zod";

/**
 * Sản phẩm từ DummyJSON API (`https://dummyjson.com/products`).
 * Chỉ giữ các field cần thiết cho UI giỏ hàng.
 */
export const ProductSchema = z.object({
	id: z.number(),
	title: z.string(),
	description: z.string(),
	category: z.string(),
	price: z.number(),
	discountPercentage: z.number(),
	rating: z.number(),
	stock: z.number(),
	brand: z.string().nullable().optional(),
	thumbnail: z.string(),
	images: z.array(z.string()).optional(),
});
export type Product = z.infer<typeof ProductSchema>;

/**
 * Response chuẩn của `GET /products` (có phân trang).
 */
export const ProductListResponseSchema = z.object({
	products: z.array(ProductSchema),
	total: z.number(),
	skip: z.number(),
	limit: z.number(),
});
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
