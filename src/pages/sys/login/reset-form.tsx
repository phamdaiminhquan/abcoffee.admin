import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { useForm } from "react-hook-form";
import { ReturnButton } from "./components/ReturnButton";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";

function ResetForm() {
	const { loginState, backToLogin } = useLoginStateContext();
	const form = useForm();

	const onFinish = (values: any) => {
		console.log("Gi\u00e1 tr\u1ecb bi\u1ec3u m\u1eabu:", values);
	};

	if (loginState !== LoginStateEnum.RESET_PASSWORD) return null;

	return (
		<>
			<div className="mb-8 text-center">
				<Icon icon="local:ic-reset-password" size="100" className="text-primary!" />
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onFinish)} className="space-y-4">
					<div className="flex flex-col items-center gap-2 text-center">
						<h1 className="text-2xl font-bold">Qu\u00ean m\u1eadt kh\u1ea9u</h1>
						<p className="text-balance text-sm text-muted-foreground">
							Nh\u1eadp email \u0111\u1ec3 nh\u1eadn li\u00ean k\u1ebft \u0111\u1eb7t l\u1ea1i
						</p>
					</div>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input placeholder="Email" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full">
						G\u1eedi email
					</Button>
					<ReturnButton onClick={backToLogin} />
				</form>
			</Form>
		</>
	);
}

export default ResetForm;
