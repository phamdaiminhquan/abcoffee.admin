import userService, { type SignUpReq } from "@/api/services/userService";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ReturnButton } from "./components/ReturnButton";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";

type RegisterFormValues = SignUpReq & {
	confirmPassword: string;
};

function RegisterForm() {
	const { loginState, backToLogin } = useLoginStateContext();

	const signUpMutation = useMutation({
		mutationFn: userService.signup,
	});

	const form = useForm<RegisterFormValues>({
		defaultValues: {
			fullName: "",
			email: "",
			password: "",
			confirmPassword: "",
			phone: "",
		},
	});

	const onFinish = async (values: RegisterFormValues) => {
		const { confirmPassword, ...payload } = values;
		await signUpMutation.mutateAsync(payload);
		toast.success("Đăng ký thành công. Vui lòng đăng nhập.");
		backToLogin();
	};

	if (loginState !== LoginStateEnum.REGISTER) return null;

	const isSubmitting = signUpMutation.isPending;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onFinish)} className="space-y-4">
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl font-bold">Đăng ký</h1>
				</div>

				<FormField
					control={form.control}
					name="fullName"
					rules={{ required: "Vui lòng nhập họ và tên" }}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input placeholder="Nguyễn Văn A" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="email"
					rules={{
						required: "Vui lòng nhập email",
						pattern: {
							value: /.+@.+\..+/,
							message: "Email không hợp lệ",
						},
					}}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="email" autoComplete="email" placeholder="Email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input autoComplete="tel" placeholder="Số điện thoại (không bắt buộc)" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="password"
					rules={{ required: "Vui lòng nhập mật khẩu" }}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="password" autoComplete="new-password" placeholder="Mật khẩu" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="confirmPassword"
					rules={{
						required: "Vui lòng xác nhận mật khẩu",
						validate: (value) => value === form.getValues("password") || "Mật khẩu không khớp",
					}}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="password" autoComplete="new-password" placeholder="Xác nhận mật khẩu" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="w-full" disabled={isSubmitting}>
					Đăng ký
				</Button>

				<div className="mb-2 text-xs text-gray">
					<span>Bằng việc đăng ký, bạn đồng ý với</span>
					<a href="./" className="text-sm underline! text-primary!">
						Điều khoản dịch vụ
					</a>
					{" & "}
					<a href="./" className="text-sm underline! text-primary!">
						Chính sách bảo mật
					</a>
				</div>

				<ReturnButton onClick={backToLogin} />
			</form>
		</Form>
	);
}

export default RegisterForm;
