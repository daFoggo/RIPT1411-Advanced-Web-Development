import { IconPackage } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format";

import {
	selectCartCount,
	selectCartItems,
	selectCartTotal,
	useCartStore,
} from "../store";
import { CartItemRow } from "./cart-item-row";

export interface CartDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Giỏ hàng dạng drawer trượt từ phải.
 * Đọc state qua atomic selectors; các action lấy từ store (typed).
 */
export const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
	const items = useCartStore(selectCartItems);
	const count = useCartStore(selectCartCount);
	const total = useCartStore(selectCartTotal);
	const clearCart = useCartStore((s) => s.clearCart);

	return (
		<Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Your cart</DrawerTitle>
					<DrawerDescription>
						{count > 0
							? `${count} item${count === 1 ? "" : "s"} in your cart`
							: "Your cart is empty"}
					</DrawerDescription>
				</DrawerHeader>

				<div className="min-h-0 flex-1 overflow-y-auto px-4">
					{items.length === 0 ? (
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<IconPackage />
								</EmptyMedia>
								<EmptyTitle>No items yet</EmptyTitle>
								<EmptyDescription>
									Browse the shop and add products to your cart.
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					) : (
						<ul className="flex flex-col gap-4">
							{items.map((item) => (
								<CartItemRow key={item.product.id} item={item} />
							))}
						</ul>
					)}
				</div>

				<DrawerFooter>
					<Separator />
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Subtotal</span>
						<span className="text-base font-semibold">
							{formatPrice(total)}
						</span>
					</div>
					<Button
						variant="outline"
						disabled={items.length === 0}
						onClick={clearCart}
					>
						Clear cart
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
};
