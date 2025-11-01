import { DB_USER } from "@/_mock/assets_backup";
import type { SignInReq } from "@/api/services/userService";
import { Icon } from "@/components/icon";
import { GLOBAL_CONFIG } from "@/global-config";
import { useSignIn } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { cn } from "@/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
	const [loading, setLoading] = useState(false);
	const [remember, setRemember] = useState(true);
	const navigatge = useNavigate();

	const { loginState, setLoginState } = useLoginStateContext();
	const signIn = useSignIn();

	const form = useForm<SignInReq>({
		defaultValues: {
			username: DB_USER[0].username,
			password: DB_USER[0].password,
		},
	});

	if (loginState !== LoginStateEnum.LOGIN) return null;

	const handleFinish = async (values: SignInReq) => {
		setLoading(true);
		try {
			await signIn(values);
			navigatge(GLOBAL_CONFIG.defaultRoute, { replace: true });
			toast.success("\u0110\u0103ng nh\u1eadp th\u00e0nh c\u00f4ng", {
				closeButton: true,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			<Form {...form} {...props}>
				<form onSubmit={form.handleSubmit(handleFinish)} className="space-y-4">
					<div className="flex flex-col items-center gap-2 text-center">
						<h1 className="text-2xl font-bold">\u0110\u0103ng nh\u1eadp</h1>
						<p className="text-balance text-sm text-muted-foreground">
							Nh\u1eadp th\u00f4ng tin t\u00e0i kho\u1ea3n c\u1ee7a b\u1ea1n
						</p>
					</div>

					<FormField
						control={form.control}
						name="username"
						rules={{ required: "Vui l\u00f2ng nh\u1eadp t\u00e0i kho\u1ea3n" }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>T\u00ean \u0111\u0103ng nh\u1eadp</FormLabel>
								<FormControl>
									<Input placeholder={DB_USER.map((user) => user.username).join("/")} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						rules={{ required: "Vui l\u00f2ng nh\u1eadp m\u1eadt kh\u1ea9u" }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>M\u1eadt kh\u1ea9u</FormLabel>
								<FormControl>
									<Input type="password" placeholder={DB_USER[0].password} {...field} suppressHydrationWarning />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Remember me / Forgot password */}
					<div className="flex flex-row justify-between">
						<div className="flex items-center space-x-2">
							<Checkbox
								id="remember"
								checked={remember}
								onCheckedChange={(checked) => setRemember(checked === "indeterminate" ? false : checked)}
							/>
							<label
								htmlFor="remember"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Ghi nh\u1edb
							</label>
						</div>
						<Button variant="link" onClick={() => setLoginState(LoginStateEnum.RESET_PASSWORD)} size="sm">
							Qu\u00ean m\u1eadt kh\u1ea9u
						</Button>
					</div>

					{/* Sign in button */}
					<Button type="submit" className="w-full">
						{loading && <Loader2 className="animate-spin mr-2" />}
						\u0110\u0103ng nh\u1eadp
					</Button>

					{/* Mobile and QR login */}
					<div className="grid gap-4 sm:grid-cols-2">
						<Button variant="outline" className="w-full" onClick={() => setLoginState(LoginStateEnum.MOBILE)}>
							<Icon icon="uil:mobile-android" size={20} />
							\u0110\u0103ng nh\u1eadp b\u1eb1ng \u0111i\u1ec7n tho\u1ea1i
						</Button>
						<Button variant="outline" className="w-full" onClick={() => setLoginState(LoginStateEnum.QR_CODE)}>
							<Icon icon="uil:qrcode-scan" size={20} />
							\u0110\u0103ng nh\u1eadp b\u1eb1ng QR
						</Button>
					</div>

					{/* Alternative login methods */}
					<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
						<span className="relative z-10 bg-background px-2 text-muted-foreground">
							Ph\u01b0\u01a1ng th\u1ee9c kh\u00e1c
						</span>
					</div>
					<div className="flex cursor-pointer justify-around text-2xl">
						<Button variant="ghost" size="icon">
							<Icon icon="mdi:github" size={24} />
						</Button>
						<Button variant="ghost" size="icon">
							<Icon icon="mdi:wechat" size={24} />
						</Button>
						<Button variant="ghost" size="icon">
							<Icon icon="ant-design:google-circle-filled" size={24} />
						</Button>
					</div>

					{/* Sign up */}
					<div className="text-center text-sm">
						Ch\u01b0a c\u00f3 t\u00e0i kho\u1ea3n?
						<Button variant="link" className="px-1" onClick={() => setLoginState(LoginStateEnum.REGISTER)}>
							\u0110\u0103ng k\u00fd
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

export default LoginForm;
