import { useState } from "react";
import { Home, MessageCircle, Bell, Bookmark, MoreHorizontal } from "lucide-react";

const Sidebar = () => {
	const [activeTab, setActiveTab] = useState("Home");

	const menuItems = [
		{ name: "Home", icon: <Home size={28} />, notifications: 0 },
		{ name: "DMs", icon: <MessageCircle size={28} />, notifications: 3 },
		{ name: "Activity", icon: <Bell size={28} />, notifications: 2 },
		{ name: "Later", icon: <Bookmark size={28} />, notifications: 2 },
		{ name: "More", icon: <MoreHorizontal size={28} />, notifications: 0 },
	];

	return (
		<aside className="w-[100px] flex flex-col items-center py-4">
			<ul className="flex flex-col space-y-6">
				{/* Avatar */}
				<li className="flex flex-col items-center">
					<a href="#">
						<img
							src="https://ui-avatars.com/api/?name=A&background=random&size=40"
							className="w-10 h-10 rounded-full"
							alt="User Avatar"
						/>
					</a>
				</li>

				{/* Menu Items */}
				{menuItems.map((item) => (
					<li
						key={item.name}
						className={`flex flex-col items-center text-white hover:text-gray-300 transition cursor-pointer px-4 py-2 rounded-md ${
							activeTab === item.name ? "bg-white bg-opacity-10" : ""
						}`}
						onClick={() => setActiveTab(item.name)}
					>
						<a href="#" className="flex flex-col items-center relative">
							<span className="hover:scale-125 transition">{item.icon}</span>
							{item.notifications > 0 && (
								<span className="absolute -top-2 -right-3 bg-white text-[#874994] text-xs px-2 py-0.5 rounded-full">
									{item.notifications}
								</span>
							)}
						</a>
						<span className="text-sm mt-1">{item.name}</span>
					</li>
				))}
			</ul>
		</aside>
	);
};

export default Sidebar;
