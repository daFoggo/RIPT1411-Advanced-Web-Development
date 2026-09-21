import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LOCALE, useI18n } from "@/lib/i18n";
import { getMeQueryOptions } from "../queries";
import { AuthDialog } from "./auth-dialog";

export interface AuthButtonProps {
	variant?: "default" | "outline";
	size?:
		"default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
	className?: string;
	dashboardHref?: string;
}

export const AuthButton = ({
	variant = "default",
	size = "default",
	className,
	dashboardHref = "/admin",
}: AuthButtonProps) => {
	const { data: user, isLoading } = useQuery(getMeQueryOptions());
	const { t, locale } = useI18n("auth");

	const [dialogOpen, setDialogOpen] = React.useState(false);

	if (isLoading) {
		return <Skeleton className="h-8 w-20" />;
	}

	// 1. Authenticated State: Simple "Go to dashboard" button
	if (user) {
		const dashboardPath = `${
			locale === DEFAULT_LOCALE ? "" : `/${locale}`
		}${dashboardHref}`;
		return (
			<Button
				render={<Link to={dashboardPath} />}
				nativeButton={false}
				variant="default"
				size={size}
				className={className}
			>
				{t("goToDashboard")}
			</Button>
		);
	}

	// 2. Unauthenticated State: Sign In only (tài khoản được tạo qua HTTP backend)
	return (
		<>
			<Button
				variant={variant}
				size={size}
				className={className}
				onClick={() => setDialogOpen(true)}
			>
				{t("signIn")}
			</Button>

			<AuthDialog open={dialogOpen} onOpenChange={setDialogOpen} />
		</>
	);
};
