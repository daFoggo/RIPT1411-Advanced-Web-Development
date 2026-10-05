import { createFileRoute } from "@tanstack/react-router";

/**
 * Route definition cho trang Shop theo chuẩn Route Code-Splitting của AnnoBot Handbook.
 * File `.tsx` chỉ chứa loader, query prefetching, route context và metadata.
 * Phần view markup và component nặng được tách sang `shop.lazy.tsx` bằng `createLazyFileRoute`.
 */
export const Route = createFileRoute("/shop")({
	head: () => ({
		meta: [
			{ title: "Product Catalog Management (10,000 Items) - React Performance" },
			{
				name: "description",
				content:
					"Enterprise catalog managing 10,000 products with Virtualization, Memoization, Code-splitting, and Concurrent UI.",
			},
		],
	}),
});
