import {
	IconAlertCircle,
	IconLoader2,
	IconLock,
	IconMail,
} from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/error";
import { useI18n } from "@/lib/i18n";
import { useLoginMutation } from "../queries";
import { LoginInputSchema } from "../schemas";

export interface SignInFormProps {
	onSuccess?: () => void;
}

const getFieldError = (err: unknown): string => {
	if (!err) return "";
	if (typeof err === "string") return err;
	if (typeof err === "object" && "message" in err) {
		return String((err as { message?: unknown }).message ?? "");
	}
	return String(err);
};

export const SignInForm = ({ onSuccess }: SignInFormProps) => {
	const loginMutation = useLoginMutation();
	const [serverError, setServerError] = React.useState<string | null>(null);
	const { t } = useI18n("auth");

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onSubmit: LoginInputSchema,
		},
		onSubmit: async ({ value }) => {
			setServerError(null);
			try {
				await loginMutation.mutateAsync(value);
				onSuccess?.();
			} catch (err) {
				setServerError(getErrorMessage(err, t("signInError")));
			}
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="flex flex-col gap-4 pt-1"
		>
			{serverError && (
				<div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
					<IconAlertCircle className="mt-0.5 size-4 shrink-0" />
					<span className="leading-snug">{serverError}</span>
				</div>
			)}

			<form.Field
				name="email"
				validators={{
					onBlur: ({ value }) => {
						const result = LoginInputSchema.shape.email.safeParse(value);
						return result.success ? undefined : result.error.issues[0]?.message;
					},
				}}
			>
				{(field) => {
					const errorMsg = getFieldError(field.state.meta.errors[0]);
					return (
						<div className="flex flex-col gap-1.5">
							<Label
								htmlFor={field.name}
								className="text-xs font-medium text-foreground"
							>
								{t("email")}
							</Label>
							<div className="relative">
								<Input
									id={field.name}
									name={field.name}
									type="email"
									placeholder={t("emailPlaceholder")}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={loginMutation.isPending}
									aria-invalid={field.state.meta.errors.length > 0}
									className="h-10 px-3 pl-9 text-sm"
								/>
								<IconMail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							</div>
							{errorMsg && (
								<p className="text-xs font-medium text-destructive">
									{errorMsg}
								</p>
							)}
						</div>
					);
				}}
			</form.Field>

			<form.Field
				name="password"
				validators={{
					onBlur: ({ value }) => {
						const result = LoginInputSchema.shape.password.safeParse(value);
						return result.success ? undefined : result.error.issues[0]?.message;
					},
				}}
			>
				{(field) => {
					const errorMsg = getFieldError(field.state.meta.errors[0]);
					return (
						<div className="flex flex-col gap-1.5">
							<Label
								htmlFor={field.name}
								className="text-xs font-medium text-foreground"
							>
								{t("password")}
							</Label>
							<div className="relative">
								<Input
									id={field.name}
									name={field.name}
									type="password"
									placeholder={t("passwordPlaceholder")}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={loginMutation.isPending}
									aria-invalid={field.state.meta.errors.length > 0}
									className="h-10 px-3 pl-9 text-sm"
								/>
								<IconLock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							</div>
							{errorMsg && (
								<p className="text-xs font-medium text-destructive">
									{errorMsg}
								</p>
							)}
						</div>
					);
				}}
			</form.Field>

			<form.Subscribe
				selector={(state) => [state.canSubmit, state.isSubmitting]}
			>
				{([canSubmit, isSubmitting]) => (
					<Button
						type="submit"
						size="lg"
						className="mt-2 w-full"
						disabled={!canSubmit || loginMutation.isPending || isSubmitting}
					>
						{loginMutation.isPending || isSubmitting ? (
							<>
								<IconLoader2 className="mr-2 size-4 animate-spin" />
								{t("signingIn")}
							</>
						) : (
							t("signIn")
						)}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
};
