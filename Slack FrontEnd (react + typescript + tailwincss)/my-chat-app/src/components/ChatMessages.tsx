import { useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";

const ChatMessages = () => {
	const [messages, setMessages] = useState([
		{
			sender: "Robert Brown",
			avatar: "https://randomuser.me/api/portraits/men/5.jpg",
			text: "Meeting is starting in 10 minutes. Be ready! ⏳",
			time: "10:50 AM",
			isUser: false,
		},
		{
			sender: "Sophia Martinez",
			avatar: "https://randomuser.me/api/portraits/women/3.jpg",
			text: "I'll be out for lunch, ping me if anything urgent! 🍔",
			time: "10:55 AM",
			isUser: false,
		},
		{
			sender: "Daniel Wilson",
			avatar: "https://randomuser.me/api/portraits/men/8.jpg",
			text: "Can we reschedule the 3 PM meeting to 4 PM instead? 📅",
			time: "11:00 AM",
			isUser: false,
		},
		{
			sender: "Olivia White",
			avatar: "https://randomuser.me/api/portraits/women/7.jpg",
			text: "Hey team! Don't forget to submit your reports by EOD. 📊",
			time: "11:05 AM",
			isUser: false,
		},
		{
			sender: "Jason Lee",
			avatar: "https://randomuser.me/api/portraits/men/10.jpg",
			text: "Great job on the latest release! 🎉",
			time: "11:10 AM",
			isUser: false,
		},
		{
			sender: "Bạn",
			avatar: "https://randomuser.me/api/portraits/men/15.jpg",
			text: "Hey everyone! Hope you're having a great day. I have some updates regarding the project...",
			time: "11:15 AM",
			isUser: true,
		},
		{
			sender: "Sophia Martinez",
			avatar: "https://randomuser.me/api/portraits/women/3.jpg",
			text: "Thanks for the updates! Could you clarify what needs to be done by EOD? 😊",
			time: "11:20 AM",
			isUser: false,
		},
		{
			sender: "Bạn",
			avatar: "https://randomuser.me/api/portraits/men/15.jpg",
			text: "Sure! The priority tasks for today include:\n1. Finalizing the design.\n2. Testing the new API integration.\n3. Preparing the report for the client.\nLet me know if anyone needs help!",
			time: "11:25 AM",
			isUser: true,
		},
		{
			sender: "Robert Brown",
			avatar: "https://randomuser.me/api/portraits/men/5.jpg",
			text: "Understood! I'll handle the API testing part. Looking forward to seeing the final results! 👍",
			time: "11:30 AM",
			isUser: false,
		},
		{
			sender: "Bạn",
			avatar: "https://randomuser.me/api/portraits/men/15.jpg",
			text: "That sounds great! If you encounter any issues, just let me know. I’ll be around. 🚀",
			time: "11:35 AM",
			isUser: true,
		},
		{
			sender: "Olivia White",
			avatar: "https://randomuser.me/api/portraits/women/7.jpg",
			text: "Just a quick reminder, the client needs the report by 4 PM. Let's make sure we’re all aligned! 📝",
			time: "11:40 AM",
			isUser: false,
		},
		{
			sender: "Bạn",
			avatar: "https://randomuser.me/api/portraits/men/15.jpg",
			text: "Noted! I'll start compiling the report soon. Thanks for the reminder! 😉",
			time: "11:45 AM",
			isUser: true,
		},
		{
			sender: "Jason Lee",
			avatar: "https://randomuser.me/api/portraits/men/10.jpg",
			text: "Looks like we're on track! Keep up the great work, everyone! 🎉",
			time: "11:50 AM",
			isUser: false,
		},
		{
			sender: "Bạn",
			avatar: "https://randomuser.me/api/portraits/men/15.jpg",
			text: "One last thing, can someone confirm the changes in the documentation? I want to make sure everything is up to date.",
			time: "11:55 AM",
			isUser: true,
		},
		{
			sender: "Sophia Martinez",
			avatar: "https://randomuser.me/api/portraits/women/3.jpg",
			text: "I’ll double-check it now! Shouldn't take long. Thanks for checking in! 😊",
			time: "12:00 PM",
			isUser: false,
		},
	]);

	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const sendMessage = (newMessage: string) => {
		const newMsg = {
			sender: "Bạn",
			avatar: "https://randomuser.me/api/portraits/men/15.jpg",
			text: newMessage,
			time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
			isUser: true,
		};
		setMessages([...messages, newMsg]);
	};

	return (
		<div className="flex flex-col h-full">
			{/* Tin nhắn */}
			<div className="flex-grow overflow-y-auto p-4">
				{messages.map((msg, index) => (
					<div key={index} className={`flex py-3 items-start hover:bg-gray-100 justify-start`}>
						{/* Avatar */}
						<img
							src={msg.avatar}
							alt="Avatar"
							className="w-[50px] h-[50px] rounded-lg border border-gray-300 flex-shrink-0"
							onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/40?text=?")}
						/>

						{/* Nội dung tin nhắn */}
						<div className={`px-3 max-w-[70%] rounded-2xl text-gray-800`}>
							{/* Tên và thời gian */}
							<div className="flex items-center space-x-2">
								<strong className="text-white-900">{msg.sender}</strong>
								<span className="text-xs text-white-500">{msg.time}</span>
							</div>
							{/* Nội dung tin nhắn */}
							<p className="mt-1">{msg.text}</p>
						</div>
					</div>
				))}
				<div ref={messagesEndRef} />
			</div>

			{/* Ô nhập tin nhắn */}
			<ChatInput onSendMessage={sendMessage} />
		</div>
	);
};

export default ChatMessages;
