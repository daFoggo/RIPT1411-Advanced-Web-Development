import { createFileRoute } from "@tanstack/react-router";
import { SITE_CONFIG } from "@/configs/site";

const HomePage = () => {
	return (
		<main className="flex min-h-screen items-center justify-center p-6">
			<div className="flex flex-col gap-6">
				<h1 className="font-title text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
					{SITE_CONFIG.app.title}
				</h1>
			</div>
		</main>
	);
};

export const Route = createFileRoute("/")({
	component: HomePage,
});
