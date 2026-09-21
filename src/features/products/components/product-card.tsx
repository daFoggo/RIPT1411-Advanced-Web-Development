import { IconStar } from "@tabler/icons-react";

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

import type { ReactNode } from "react";

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
 * Thẻ sản phẩm — nhận `onAddToCart` / `favoriteAction` qua props (route inject
 * callback/UI của feature khác, component không tự gọi store của feature khác).
 */
export const ProductCard = ({
	product,
	onAddToCart,
	favoriteAction,
}: ProductCardProps) => {
	return (
		<Card className="overflow-hidden">
			<div className="relative aspect-square overflow-hidden bg-muted">
				<img
					src={product.thumbnail}
					alt={product.title}
					loading="lazy"
					className="h-full w-full object-cover"
				/>
				{favoriteAction && (
					<div className="absolute top-2 right-2">{favoriteAction}</div>
				)}
			</div>
			<CardHeader>
				<div className="flex items-start justify-between gap-2">
					<CardTitle className="line-clamp-1">{product.title}</CardTitle>
					<Badge variant="outline" className="shrink-0 capitalize">
						{product.category}
					</Badge>
				</div>
				<CardDescription className="line-clamp-2">
					{product.description}
				</CardDescription>
			</CardHeader>
			<CardContent className="flex items-center justify-between">
				<span className="text-base font-semibold">
					{formatPrice(product.price)}
				</span>
				<span className="flex items-center gap-1 text-xs text-muted-foreground">
					<IconStar className="size-3.5" />
					{product.rating.toFixed(1)}
				</span>
			</CardContent>
			<CardFooter>
				<Button className="w-full" onClick={() => onAddToCart(product)}>
					Add to cart
				</Button>
			</CardFooter>
		</Card>
	);
};
