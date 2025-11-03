import { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
	onSendMessage: (message: string) => void;
}

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
	const [message, setMessage] = useState("");

	const handleSend = () => {
		if (message.trim() === "") return; // Không gửi tin nhắn rỗng
		onSendMessage(message);
		setMessage(""); // Xóa nội dung sau khi gửi
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="flex items-center p-2 border-t bg-white">
			<input
				type="text"
				className="flex-grow p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="Type a message..."
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				onKeyPress={handleKeyPress}
			/>
			<button
				onClick={handleSend}
				className="ml-3 p-3 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition"
			>
				<Send size={20} />
			</button>
		</div>
	);
};

export default ChatInput;
