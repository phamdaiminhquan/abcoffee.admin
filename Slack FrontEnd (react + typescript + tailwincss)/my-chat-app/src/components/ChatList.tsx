import { useState } from "react";
import { ChevronDown, Menu, Hash, Send, MessageCircle } from "lucide-react";

// Dữ liệu danh sách các mục
const sections = [
	{ name: "Unreads", icon: <MessageCircle size={20} /> },
	{ name: "Drafts & Sent", icon: <Send size={20} /> },
];

const channels = ["announcements", "random", "design-crit"];
const gizmoChannels = ["launch-gizmo", "team-gizmo", "project-gizmo"];

const directMessages = [
	{ name: "Lee Hao", img: "https://randomuser.me/api/portraits/men/1.jpg", messages: 2 },
	{ name: "Sara Parras", img: "https://randomuser.me/api/portraits/men/2.jpg", messages: 1 },
];

const ChatList = () => {
	const [activeItem, setActiveItem] = useState("project-gizmo");

	return (
		<div className="w-[300px] bg-[#D8C5DB] p-5 h-full overflow-y-auto flex-shrink-0">
			{/* Header */}
			<div className="flex justify-between items-center text-gray-800 font-bold text-xl px-2">
				<span className="flex items-center">
					Acme Inc <ChevronDown size={18} className="ml-1" />
				</span>
				<Menu size={20} />
			</div>

			{/* Sections (Unreads, Drafts & Sent) */}
			<ul className="mt-2 text-gray-800">
				{sections.map((item) => (
					<li
						key={item.name}
						onClick={() => setActiveItem(item.name)}
						className={`flex items-center px-2 py-2 border-none cursor-pointer rounded-lg hover:bg-[#83388A] hover:text-white ${
							activeItem === item.name ? "bg-[#83388A] text-white" : "bg-transparent"
						}`}
					>
						{item.icon}
						<span className="ml-2">{item.name}</span>
					</li>
				))}
			</ul>

			{/* Channels */}
			<h5 className="text-gray-700 font-semibold mt-3 px-2">Channels</h5>
			<ul className="text-gray-800">
				{channels.map((channel) => (
					<li
						key={channel}
						onClick={() => setActiveItem(channel)}
						className={`flex items-center px-2 py-2 border-none cursor-pointer rounded-lg hover:bg-[#83388A] hover:text-white ${
							activeItem === channel ? "bg-[#83388A] text-white" : "bg-transparent"
						}`}
					>
						<Hash size={20} className="mr-2" />
						{channel}
					</li>
				))}
			</ul>

			{/* Gizmo */}
			<h5 className="text-gray-700 font-semibold mt-3 px-2">🚀 Gizmo</h5>
			<ul className="text-gray-800">
				{gizmoChannels.map((channel) => (
					<li
						key={channel}
						onClick={() => setActiveItem(channel)}
						className={`flex justify-between items-center px-2 py-2 border-none cursor-pointer rounded-lg hover:bg-[#83388A] hover:text-white ${
							activeItem === channel ? "bg-[#83388A] text-white" : "bg-transparent"
						}`}
					>
						<span className="flex items-center">
							<Hash size={20} className="mr-2" />
							{channel}
						</span>
					</li>
				))}
			</ul>

			{/* Direct Messages */}
			<h5 className="text-gray-700 font-semibold mt-3 px-2">Direct Messages</h5>
			<ul className="text-gray-800">
				{directMessages.map((user) => (
					<li
						key={user.name}
						onClick={() => setActiveItem(user.name)}
						className={`flex justify-between items-center px-2 py-2 border-none cursor-pointer rounded-lg hover:bg-[#83388A] hover:text-white ${
							activeItem === user.name ? "bg-[#83388A] text-white" : "bg-transparent"
						}`}
					>
						<div className="flex items-center">
							<img src={user.img} alt={user.name} className="w-6 h-6 rounded-full mr-2" />
							<span className="font-medium">{user.name}</span>
						</div>
						<span className="bg-[#601B6C] text-white px-2 py-0.5 rounded-full text-xs">{user.messages}</span>
					</li>
				))}
			</ul>
		</div>
	);
};

export default ChatList;
