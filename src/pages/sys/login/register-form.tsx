import userService from "@/api/services/userService";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ReturnButton } from "./components/ReturnButton";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";

function RegisterForm() {
	const { loginState, backToLogin } = useLoginStateContext();

	const signUpMutation = useMutation({
		mutationFn: userService.signup,
	});

	const form = useForm({
		defaultValues: {
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const onFinish = async (values: any) => {
		console.log("Gi\u00e1 tr\u1ecb bi\u1ec3u m\u1eabu:", values);
		await signUpMutation.mutateAsync(values);
		backToLogin();
	};

	if (loginState !== LoginStateEnum.REGISTER) return null;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onFinish)} className="space-y-4">
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl font-bold">\u0110\u0103ng k\u00fd</h1>
				</div>

				<FormField
					control={form.control}
					name="username"
					rules={{ required: "Vui l\u00f2ng nh\u1eadp t\u00ean \u0111\u0103ng nh\u1eadp" }}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input placeholder="T\u00ean \u0111\u0103ng nh\u1eadp" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="email"
					rules={{ required: "Vui l\u00f2ng nh\u1eadp email" }}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input placeholder="Email" {...field} />
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
							<FormControl>
								<Input type="password" placeholder="M\u1eadt kh\u1ea9u" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="confirmPassword"
					rules={{
						required: "Vui l\u00f2ng x\u00e1c nh\u1eadn m\u1eadt kh\u1ea9u",
						validate: (value) => value === form.getValues("password") || "M\u1eadt kh\u1ea9u kh\u00f4ng kh\u1edbp",
					}}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="password" placeholder="X\u00e1c nh\u1eadn m\u1eadt kh\u1ea9u" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="w-full">
					\u0110\u0103ng k\u00fd
				</Button>

				<div className="mb-2 text-xs text-gray">
					<span>B\u1eb1ng vi\u1ec7c \u0111\u0103ng k\u00fd, b\u1ea1n \u0111\u1ed3ng \u00fd v\u1edbi</span>
					<a href="./" className="text-sm underline! text-primary!">
						\u0110i\u1ec1u kho\u1ea3n d\u1ecbch v\u1ee5
					</a>
					{" & "}
					<a href="./" className="text-sm underline! text-primary!">
						Ch\u00ednh s\u00e1ch b\u1ea3o m\u1eadt
					</a>
				</div>

				<ReturnButton onClick={backToLogin} />
			</form>
		</Form>
	);
}

export default RegisterForm;
