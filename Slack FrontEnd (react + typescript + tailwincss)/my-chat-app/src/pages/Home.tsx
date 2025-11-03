import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ChatList from "../components/ChatList";
import ChatContent from "../components/ChatContent";

const Home = () => {
	return (
		<div className="h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #874994, #612563)" }}>
			{/* Header với chiều cao cố định */}
			<div className="h-[40px]">
				<Header />
			</div>

			{/* Main Content (chiếm toàn bộ phần còn lại) */}
			<div className="flex h-[calc(100vh-40px)] pr-1.5 pb-1.5">
				{/* Sidebar (Nằm bên trái) */}
				<Sidebar />

				{/* Chat Area - Bọc cả ChatList và ChatContent */}
				<div className="flex flex-grow bg-white rounded-lg shadow-md overflow-hidden">
					{/* Chat List */}
					<ChatList />

					{/* Chat Content */}
					<ChatContent />
				</div>
			</div>
		</div>
	);
};

export default Home;
