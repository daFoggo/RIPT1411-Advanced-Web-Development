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

import type { Product } from "../schemas";

export interface ProductCardProps {
	product: Product;
	onAddToCart: (product: Product) => void;
}

/**
 * Thẻ sản phẩm — nhận `onAddToCart` qua props (route/cart feature inject callback,
 * component không tự gọi store của feature khác).
 */
export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
	return (
		<Card className="overflow-hidden">
			<div className="aspect-square overflow-hidden bg-muted">
				<img
					src={product.thumbnail}
					alt={product.title}
					loading="lazy"
					className="h-full w-full object-cover"
				/>
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
