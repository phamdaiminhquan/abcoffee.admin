import { createContext, useState, useEffect, ReactNode } from "react";

// Định nghĩa kiểu dữ liệu của tin nhắn
interface Message {
	name: string;
	text: string;
	time: string;
}

// Định nghĩa kiểu dữ liệu cho context
interface ChatContextType {
	messages: Message[];
	sendMessage: (text: string) => void;
}

// Tạo context với giá trị mặc định
export const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Lấy dữ liệu tin nhắn từ LocalStorage (nếu có)
const STORAGE_KEY = "chat_messages";

export const ChatProvider = ({ children }: { children: ReactNode }) => {
	const [messages, setMessages] = useState<Message[]>(() => {
		const storedMessages = localStorage.getItem(STORAGE_KEY);
		return storedMessages ? JSON.parse(storedMessages) : [];
	});

	// Lưu tin nhắn vào LocalStorage khi messages thay đổi
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
	}, [messages]);

	// Hàm gửi tin nhắn mới
	const sendMessage = (text: string) => {
		const newMessage: Message = {
			name: "You",
			text,
			time: new Date().toLocaleTimeString(),
		};
		setMessages((prevMessages) => [...prevMessages, newMessage]);
	};

	return <ChatContext.Provider value={{ messages, sendMessage }}>{children}</ChatContext.Provider>;
};
