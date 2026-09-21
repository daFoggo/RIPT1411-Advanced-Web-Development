import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

import type { CartItem } from "../store";
import { useCartStore } from "../store";

interface CartItemRowProps {
	item: CartItem;
}

/**
 * Một dòng sản phẩm trong giỏ: ảnh, tên, giá, bộ điều chỉnh số lượng, xoá.
 */
const CartItemRow = ({ item }: CartItemRowProps) => {
	const updateQuantity = useCartStore((s) => s.updateQuantity);
	const removeItem = useCartStore((s) => s.removeItem);
	const { product, quantity } = item;

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
				<p className="text-xs text-muted-foreground">
					{formatPrice(product.price)} × {quantity}
				</p>
				<div className="mt-1 flex items-center gap-1">
					<Button
						variant="outline"
						size="icon-xs"
						onClick={() => updateQuantity(product.id, quantity - 1)}
						aria-label="Decrease quantity"
						disabled={quantity <= 1}
					>
						<IconMinus />
					</Button>
					<span className="w-6 text-center text-xs font-medium tabular-nums">
						{quantity}
					</span>
					<Button
						variant="outline"
						size="icon-xs"
						onClick={() => updateQuantity(product.id, quantity + 1)}
						aria-label="Increase quantity"
						disabled={quantity >= product.stock}
					>
						<IconPlus />
					</Button>
				</div>
			</div>

			<div className="flex shrink-0 flex-col items-end gap-1.5">
				<span className="text-sm font-semibold">
					{formatPrice(product.price * quantity)}
				</span>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={() => removeItem(product.id)}
					aria-label={`Remove ${product.title} from cart`}
				>
					<IconTrash />
				</Button>
			</div>
		</li>
	);
};

export { CartItemRow };
