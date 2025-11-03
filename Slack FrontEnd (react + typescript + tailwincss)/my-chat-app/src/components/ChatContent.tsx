import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";

const ChatContent = () => {
	return (
		<div className="flex flex-col flex-grow bg-white rounded-lg shadow-md overflow-hidden">
			{/* Header (Cố định trên cùng) */}
			<ChatHeader />

			{/* Messages (Có thanh cuộn nếu tin nhắn dài) */}
			<div className="flex-grow overflow-y-auto">
				<ChatMessages />
			</div>
		</div>
	);
};

export default ChatContent;
