import { IconHeart, IconHeartFilled } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

import type { Product } from "@/features/products";

import { selectIsFavorite, useFavoritesStore } from "../store";

export interface FavoriteButtonProps {
	product: Product;
}

/**
 * Nút thêm/bỏ sản phẩm khỏi danh sách yêu thích.
 * Đọc trạng thái qua selector factory `selectIsFavorite(id)` — chỉ re-render
 * khi trạng thái của đúng sản phẩm này thay đổi.
 */
export const FavoriteButton = ({ product }: FavoriteButtonProps) => {
	const isFavorite = useFavoritesStore(selectIsFavorite(product.id));
	const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

	return (
		<Button
			variant={isFavorite ? "secondary" : "outline"}
			size="icon-sm"
			onClick={() => toggleFavorite(product)}
			aria-label={
				isFavorite
					? `Remove ${product.title} from favorites`
					: `Add ${product.title} to favorites`
			}
			aria-pressed={isFavorite}
		>
			{isFavorite ? <IconHeartFilled /> : <IconHeart />}
		</Button>
	);
};
