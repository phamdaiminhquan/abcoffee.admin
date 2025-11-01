import { QRCodeSVG } from "qrcode.react";
import { ReturnButton } from "./components/ReturnButton";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";

function QrCodeFrom() {
	const { loginState, backToLogin } = useLoginStateContext();

	if (loginState !== LoginStateEnum.QR_CODE) return null;
	return (
		<>
			<div className="flex flex-col items-center gap-2 text-center">
				<h1 className="text-2xl font-bold">\u0110\u0103ng nh\u1eadp b\u1eb1ng QR</h1>
				<p className="text-balance text-sm text-muted-foreground">
					Qu\u00e9t m\u00e3 QR tr\u00ean \u1ee9ng d\u1ee5ng \u0111\u1ec3 \u0111\u0103ng nh\u1eadp
				</p>
			</div>

			<div className="flex w-full flex-col items-center justify-center p-4">
				<QRCodeSVG value="https://github.com/d3george/slash-admin" size={200} />
			</div>
			<ReturnButton onClick={backToLogin} />
		</>
	);
}

export default QrCodeFrom;
