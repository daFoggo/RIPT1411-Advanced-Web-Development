import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { IconAlertCircle, IconShoppingBag } from "@tabler/icons-react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { CartButton, CartDrawer, useCartStore } from "@/features/cart";
import {
	FavoriteButton,
	FavoritesButton,
	FavoritesDrawer,
} from "@/features/favorites";
import { ProductCard, productsQueryOptions } from "@/features/products";
import { getErrorMessage } from "@/lib/error";

const ProductGridSkeleton = () => (
	<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{Array.from({ length: 6 }).map((_, index) => (
			<div
				key={index}
				className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
			>
				<Skeleton className="aspect-square w-full rounded-lg" />
				<Skeleton className="h-4 w-2/3" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="mt-2 h-8 w-full" />
			</div>
		))}
	</div>
);

const ShopPage = () => {
	const [cartOpen, setCartOpen] = useState(false);
	const [favoritesOpen, setFavoritesOpen] = useState(false);
	const { data, isPending, isError, error } = useQuery(productsQueryOptions());
	const addItem = useCartStore((s) => s.addItem);

	return (
		<main className="mx-auto min-h-screen w-full max-w-6xl p-6">
			<header className="mb-8 flex items-center justify-between gap-4">
				<div>
					<h1 className="font-title text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						Shop
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Products powered by the DummyJSON API.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<FavoritesButton onOpen={() => setFavoritesOpen(true)} />
					<CartButton onOpen={() => setCartOpen(true)} />
				</div>
			</header>

			{isPending ? (
				<ProductGridSkeleton />
			) : isError ? (
				<Alert variant="destructive">
					<IconAlertCircle className="size-4" />
					<AlertTitle>Failed to load products</AlertTitle>
					<AlertDescription>
						{getErrorMessage(
							error,
							"Could not load products from the DummyJSON API.",
						)}
					</AlertDescription>
				</Alert>
			) : data.products.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<IconShoppingBag />
						</EmptyMedia>
						<EmptyTitle>No products available</EmptyTitle>
						<EmptyDescription>Check back later.</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{data.products.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							onAddToCart={addItem}
							favoriteAction={<FavoriteButton product={product} />}
						/>
					))}
				</div>
			)}

			<FavoritesDrawer open={favoritesOpen} onOpenChange={setFavoritesOpen} />
			<CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
		</main>
	);
};

export const Route = createFileRoute("/shop")({
	component: ShopPage,
});
