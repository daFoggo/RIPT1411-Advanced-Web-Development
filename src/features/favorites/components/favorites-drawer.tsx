import { IconHeart } from "@tabler/icons-react";

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

import {
	selectFavoriteCount,
	selectFavoriteItems,
	useFavoritesStore,
} from "../store";
import { FavoriteItemRow } from "./favorite-item-row";

export interface FavoritesDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Danh sách yêu thích dạng drawer trượt từ phải.
 * Đọc state qua atomic selectors; các action lấy từ store (typed).
 */
export const FavoritesDrawer = ({
	open,
	onOpenChange,
}: FavoritesDrawerProps) => {
	const items = useFavoritesStore(selectFavoriteItems);
	const count = useFavoritesStore(selectFavoriteCount);
	const clearFavorites = useFavoritesStore((s) => s.clearFavorites);

	return (
		<Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
			<DrawerContent className="[--drawer-inset:0.75rem] [--drawer-bleed-background:transparent] rounded-xl border shadow-lg">
				<DrawerHeader>
					<DrawerTitle>Favorites</DrawerTitle>
					<DrawerDescription>
						{count > 0
							? `${count} saved product${count === 1 ? "" : "s"}`
							: "No favorites yet"}
					</DrawerDescription>
				</DrawerHeader>

				<div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
					{items.length === 0 ? (
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<IconHeart />
								</EmptyMedia>
								<EmptyTitle>No favorites yet</EmptyTitle>
								<EmptyDescription>
									Tap the heart on any product to save it here.
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					) : (
						<ul className="flex flex-col gap-4">
							{items.map((item) => (
								<FavoriteItemRow key={item.product.id} item={item} />
							))}
						</ul>
					)}
				</div>

				<DrawerFooter>
					<Separator />
					<Button
						variant="outline"
						disabled={items.length === 0}
						onClick={clearFavorites}
					>
						Clear favorites
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
};
