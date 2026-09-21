import { IconShoppingCart } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { selectCartCount, useCartStore } from "../store";

export interface CartButtonProps {
	onOpen: () => void;
}

/**
 * Nút mở giỏ hàng, hiển thị badge số lượng item.
 * Đọc count qua atomic selector để chỉ re-render khi count thay đổi.
 */
export const CartButton = ({ onOpen }: CartButtonProps) => {
	const count = useCartStore(selectCartCount);

	return (
		<div className="relative">
			<Button
				variant="outline"
				size="icon"
				onClick={onOpen}
				aria-label="Open cart"
			>
				<IconShoppingCart />
			</Button>
			{count > 0 && (
				<Badge
					variant="destructive"
					className="pointer-events-none absolute -top-1.5 -right-1.5 px-1.5"
				>
					{count}
				</Badge>
			)}
		</div>
	);
};
