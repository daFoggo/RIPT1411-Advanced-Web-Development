import "@tanstack/react-start/server-only";

import ky from "ky";

import { ProductListResponseSchema } from "./schemas";
import type { Product, ProductListResponse } from "./schemas";

const DUMMYJSON_BASE_URL = "https://dummyjson.com";

const PRODUCT_FIELDS =
	"id,title,description,category,price,discountPercentage,rating,stock,brand,thumbnail,images";

const dummyJsonApi = ky.create({
	prefix: DUMMYJSON_BASE_URL,
	timeout: 30000,
});

const CATEGORIES = [
	"smartphones",
	"laptops",
	"fragrances",
	"skincare",
	"groceries",
	"home-decoration",
	"furniture",
	"tops",
	"womens-dresses",
	"mens-shirts",
	"mens-shoes",
	"mens-watches",
	"womens-watches",
	"womens-bags",
	"sunglasses",
	"lighting",
] as const;

const BRANDS = [
	"Apple",
	"Samsung",
	"Sony",
	"Dell",
	"HP",
	"Lenovo",
	"Asus",
	"Nike",
	"Adidas",
	"Puma",
	"Zara",
	"Gucci",
	"Rolex",
	"L'Oreal",
	"Ikea",
	"Philips",
	"Canon",
	"Bose",
	"Xiaomi",
	"Logitech",
] as const;

const ADJECTIVES = [
	"Pro",
	"Ultra",
	"Max",
	"Elite",
	"Prime",
	"Air",
	"Classic",
	"Essential",
	"Wireless",
	"Smart",
	"Premium",
	"Eco",
	"Compact",
	"Studio",
	"Gaming",
] as const;

const NOUNS = [
	"Device",
	"Series",
	"Edition",
	"Model",
	"Kit",
	"Pack",
	"Station",
	"Hub",
	"Unit",
	"Set",
] as const;

const generateSvgThumbnail = (id: number, category: string, brand: string) => {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><rect width="320" height="320" fill="%23f8fafc"/><rect x="16" y="16" width="288" height="288" rx="12" fill="%23f1f5f9" stroke="%23e2e8f0" stroke-width="2"/><text x="50%" y="38%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="14" font-weight="600" fill="%2364748b">${brand}</text><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="18" font-weight="700" fill="%230f172a">${category}</text><text x="50%" y="68%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="13" fill="%2394a3b8">#${id.toString().padStart(5, "0")}</text></svg>`;
	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const generate10kProducts = (count = 10000): Product[] => {
	const items: Product[] = [];
	for (let i = 1; i <= count; i++) {
		const category = CATEGORIES[i % CATEGORIES.length];
		const brand = BRANDS[i % BRANDS.length];
		const adj = ADJECTIVES[(i * 3) % ADJECTIVES.length];
		const noun = NOUNS[(i * 7) % NOUNS.length];
		const price = Math.round((15 + (i * 13.37) % 1980) * 100) / 100;
		const discount = Math.round(((i * 7.1) % 35) * 10) / 10;
		const rating = Math.round((3.0 + ((i * 1.7) % 2.0)) * 10) / 10;
		const stock = (i * 17) % 450;

		items.push({
			id: i,
			title: `${brand} ${adj} ${noun} ${i}`,
			description: `High-quality ${category} item designed by ${brand}. Features ${adj.toLowerCase()} grade materials with durable performance.`,
			category,
			price,
			discountPercentage: discount,
			rating,
			stock,
			brand,
			thumbnail: generateSvgThumbnail(i, category, brand),
			images: [],
		});
	}
	return items;
};

let cached10kCatalog: ProductListResponse | null = null;

/**
 * Gọi DummyJSON API lấy danh sách sản phẩm (khi limit nhỏ)
 * hoặc sinh tập dữ liệu 10.000 sản phẩm giả lập chuẩn schema phục vụ bài toán tối ưu.
 */
export const getProducts = async (limit = 10000): Promise<ProductListResponse> => {
	if (limit >= 500) {
		if (!cached10kCatalog || cached10kCatalog.products.length !== limit) {
			const products = generate10kProducts(limit);
			cached10kCatalog = {
				products,
				total: limit,
				skip: 0,
				limit,
			};
		}
		return cached10kCatalog;
	}

	const response = await dummyJsonApi
		.get(`products?limit=${limit}&select=${PRODUCT_FIELDS}`)
		.json();

	const parsed = ProductListResponseSchema.safeParse(response);
	if (!parsed.success) {
		throw new Error("DummyJSON returned an unexpected products payload");
	}

	return parsed.data;
};
