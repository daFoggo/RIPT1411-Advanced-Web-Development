import { IconHeart } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { selectFavoriteCount, useFavoritesStore } from "../store";

export interface FavoritesButtonProps {
	onOpen: () => void;
}

/**
 * Nút mở danh sách yêu thích, hiển thị badge số lượng.
 * Đọc count qua atomic selector để chỉ re-render khi count thay đổi.
 */
export const FavoritesButton = ({ onOpen }: FavoritesButtonProps) => {
	const count = useFavoritesStore(selectFavoriteCount);

	return (
		<div className="relative">
			<Button
				variant="outline"
				size="icon"
				onClick={onOpen}
				aria-label="Open favorites"
			>
				<IconHeart />
			</Button>
			{count > 0 && (
				<Badge
					variant="secondary"
					className="pointer-events-none absolute -top-1.5 -right-1.5 px-1.5"
				>
					{count}
				</Badge>
			)}
		</div>
	);
};
