import * as React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { SignInForm } from "./sign-in-form";

export interface AuthDialogProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	trigger?: React.ReactNode;
	children?: React.ReactNode;
}

/* Chỉ Sign In — tài khoản được tạo qua HTTP backend. */
export const AuthDialog = ({
	open,
	onOpenChange,
	trigger,
	children,
}: AuthDialogProps) => {
	const [internalOpen, setInternalOpen] = React.useState(false);

	const isControlled = open !== undefined;
	const isOpen = isControlled ? open : internalOpen;
	const handleOpenChange = onOpenChange ?? setInternalOpen;
	const { t } = useI18n("auth");

	const handleSuccess = () => {
		handleOpenChange(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			{trigger && <DialogTrigger>{trigger}</DialogTrigger>}
			{children}
			<DialogContent className="p-6 sm:max-w-md sm:p-8">
				<DialogHeader className="text-left">
					<DialogTitle className="text-xl tracking-tight">
						{t("welcomeBack")}
					</DialogTitle>
					<DialogDescription className="text-xs text-muted-foreground sm:text-sm">
						{t("signInDesc")}
					</DialogDescription>
				</DialogHeader>

				<div className="mt-2">
					<SignInForm onSuccess={handleSuccess} />
				</div>
			</DialogContent>
		</Dialog>
	);
};
