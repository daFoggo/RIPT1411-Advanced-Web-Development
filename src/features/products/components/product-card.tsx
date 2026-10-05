import { IconStar } from "@tabler/icons-react";
import { memo } from "react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import type { Product } from "../schemas";

export interface ProductCardProps {
	product: Product;
	onAddToCart: (product: Product) => void;
	/**
	 * Nút hành động đè lên ảnh (vd: nút yêu thích) — được route/container inject
	 * vào, products feature không import UI của feature khác.
	 */
	favoriteAction?: ReactNode;
}

/**
 * Thẻ sản phẩm — tối ưu hóa với React.memo để ngăn re-render không cần thiết
 * khi các state cha (giỏ hàng, filter, modal) thay đổi.
 * Hình ảnh có aspect-ratio cố định và decoding="async" để đạt CLS = 0.
 */
const ProductCardComponent = ({
	product,
	onAddToCart,
	favoriteAction,
}: ProductCardProps) => {
	return (
		<Card className="overflow-hidden flex flex-col justify-between h-full bg-card ring-1 ring-border/50">
			<div>
				<div className="relative aspect-square w-full overflow-hidden bg-muted">
					<img
						src={product.thumbnail}
						alt={product.title}
						loading="lazy"
						decoding="async"
						width={320}
						height={320}
						className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
					/>
					{favoriteAction && (
						<div className="absolute top-2 right-2">{favoriteAction}</div>
					)}
				</div>
				<CardHeader className="p-4 pb-2">
					<div className="flex items-start justify-between gap-2">
						<CardTitle className="line-clamp-1 text-sm font-semibold">{product.title}</CardTitle>
						<Badge variant="outline" className="shrink-0 text-[10px] capitalize px-1.5 py-0">
							{product.category}
						</Badge>
					</div>
					<CardDescription className="line-clamp-2 text-xs">
						{product.description}
					</CardDescription>
				</CardHeader>
			</div>
			<div>
				<CardContent className="p-4 py-2 flex items-center justify-between">
					<span className="text-sm font-bold text-foreground">
						{formatPrice(product.price)}
					</span>
					<span className="flex items-center gap-1 text-xs text-muted-foreground">
						<IconStar className="size-3.5 fill-amber-400 text-amber-400" />
						{product.rating.toFixed(1)}
					</span>
				</CardContent>
				<CardFooter className="p-4 pt-1">
					<Button
						size="sm"
						className="w-full text-xs h-8"
						onClick={() => onAddToCart(product)}
					>
						Add to cart
					</Button>
				</CardFooter>
			</div>
		</Card>
	);
};

export const ProductCard = memo(ProductCardComponent, (prev, next) => {
	return (
		prev.product.id === next.product.id &&
		prev.product.price === next.product.price &&
		prev.product.stock === next.product.stock &&
		prev.product.rating === next.product.rating &&
		prev.onAddToCart === next.onAddToCart &&
		prev.favoriteAction === next.favoriteAction
	);
});
