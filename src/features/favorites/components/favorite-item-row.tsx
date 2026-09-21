import { IconHeartOff } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

import type { FavoriteItem } from "../store";
import { useFavoritesStore } from "../store";

interface FavoriteItemRowProps {
	item: FavoriteItem;
}

/**
 * Một dòng sản phẩm trong danh sách yêu thích: ảnh, tên, giá, nút bỏ thích.
 */
const FavoriteItemRow = ({ item }: FavoriteItemRowProps) => {
	const removeFavorite = useFavoritesStore((s) => s.removeFavorite);
	const { product } = item;

	return (
		<li className="flex items-center gap-3">
			<div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
				<img
					src={product.thumbnail}
					alt={product.title}
					loading="lazy"
					className="h-full w-full object-cover"
				/>
			</div>

			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<p className="line-clamp-1 text-sm font-medium">{product.title}</p>
				<p className="text-xs text-muted-foreground">{product.category}</p>
				<span className="text-sm font-semibold">
					{formatPrice(product.price)}
				</span>
			</div>

			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => removeFavorite(product.id)}
				aria-label={`Remove ${product.title} from favorites`}
			>
				<IconHeartOff />
			</Button>
		</li>
	);
};

export { FavoriteItemRow };
