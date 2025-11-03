import { ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";

const Header = () => {
	return (
		<header className="flex items-center justify-between px-4 py-0.5">
			{/* Nút điều hướng */}
			<div className="flex space-x-2">
				<button className="p-2 text-white">
					<ArrowLeft size={24} />
				</button>
				<button className="p-2 text-white">
					<ArrowRight size={24} />
				</button>
			</div>

			{/* Thanh tìm kiếm */}
			<input
				type="text"
				className="form-control w-1/3 h-7 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
				placeholder="Search"
			/>

			{/* Biểu tượng Question Circle */}
			<button className="p-2 text-white">
				<HelpCircle size={24} />
			</button>
		</header>
	);
};

export default Header;
