import { ChevronDown, Headphones, ExternalLink, Folder, Plus, Pin } from "lucide-react";

const ChatHeader = () => {
	return (
		<div className="p-3 bg-gray-100 border-b shadow-sm flex flex-col">
			{/* Dòng đầu tiên: Tên kênh + Avatar Stack + Huddle/Canvas */}
			<div className="flex justify-between items-center">
				{/* Tên kênh */}
				<h4 className="font-bold text-2xl flex items-center">
					# project-gizmo <ChevronDown size={18} className="ml-1" />
				</h4>

				{/* Container chứa Avatar Stack & Nút điều khiển */}
				<div className="flex items-center gap-3">
					{/* Avatar Stack */}

					<button className="p-1 border rounded-md flex items-center hover:bg-gray-200 transition">
						<div className="flex -space-x-2">
							<img
								src="https://ui-avatars.com/api/?name=A&background=random&size=32"
								className="w-6 h-6 rounded-full border border-white"
							/>
							<img
								src="https://ui-avatars.com/api/?name=B&background=random&size=32"
								className="w-6 h-6 rounded-full border border-white"
							/>
							<img
								src="https://ui-avatars.com/api/?name=C&background=random&size=32"
								className="w-6 h-6 rounded-full border border-white"
							/>
						</div>
					</button>
					<button className="p-2 border rounded-md flex items-center hover:bg-gray-200 transition">
						<span className="text-gray-800 text-xs rounded-md font-bold">+17</span>
					</button>

					{/* Nút Huddle */}
					<button className="p-2 border rounded-md flex items-center hover:bg-gray-200 transition">
						<Headphones size={18} />
						<ChevronDown size={14} className="ml-1" />
					</button>

					{/* Nút Canvas */}
					<button className="p-2 border rounded-md hover:bg-gray-200 transition">
						<ExternalLink size={18} />
					</button>
				</div>
			</div>

			{/* Dòng thứ hai: Pinned, Resources, Add */}
			<div className="flex items-center gap-4 mt-2">
				{/* Pinned */}
				<div className="flex items-center cursor-pointer hover:text-gray-500">
					<Pin size={16} />
					<span className="ml-2 text-sm">3 Pinned</span>
					<ChevronDown size={14} className="ml-1" />
				</div>

				{/* Resources */}
				<div className="flex items-center cursor-pointer hover:text-gray-500">
					<Folder size={16} />
					<span className="ml-2 text-sm">Resources</span>
					<ChevronDown size={14} className="ml-1" />
				</div>

				{/* Add */}
				<div className="flex items-center cursor-pointer hover:text-gray-500">
					<Plus size={16} />
				</div>
			</div>
		</div>
	);
};

export default ChatHeader;
