import { queryOptions } from "@tanstack/react-query";

import { getProductsFn } from "./functions";

export const productKeys = {
	all: ["products"] as const,
	lists: () => [...productKeys.all, "list"] as const,
	list: (limit: number) => [...productKeys.lists(), { limit }] as const,
};

/**
 * Query options cho danh sách sản phẩm.
 * Dùng chung được ở route loader, component, và cache API.
 */
export const productsQueryOptions = (limit = 10000) =>
	queryOptions({
		queryKey: productKeys.list(limit),
		queryFn: () => getProductsFn({ data: limit }),
	});
