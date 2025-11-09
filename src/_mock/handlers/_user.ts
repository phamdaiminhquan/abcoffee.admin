import { UserApi } from "@/api/services/userService";
import { convertFlatToTree } from "@/utils/tree";
import { faker } from "@faker-js/faker";
import { http, HttpResponse } from "msw";
import { DB_MENU, DB_PERMISSION, DB_ROLE, DB_ROLE_PERMISSION, DB_USER, DB_USER_ROLE } from "../assets_backup";

const buildUserProfile = (user: Record<string, any>) => {
	const { password: _password, username, ...rest } = user;
	const roleMappings = DB_USER_ROLE.filter((item) => item.userId === user.id)
		.map((item) => DB_ROLE.find((role) => role.id === item.roleId))
		.filter(Boolean);
	const permissionMappings = DB_ROLE_PERMISSION.filter((item) => roleMappings.some((role) => role?.id === item.roleId))
		.map((item) => DB_PERMISSION.find((permission) => permission.id === item.permissionId))
		.filter(Boolean);
	const fullName = typeof rest.fullName === "string" && rest.fullName.length ? rest.fullName : username;
	const phone = typeof rest.phone === "string" && rest.phone.length ? rest.phone : faker.phone.number("09########");
	const createdAt = rest.createdAt ?? faker.date.past().toISOString();
	const updatedAt = rest.updatedAt ?? new Date().toISOString();

	return {
		...rest,
		username,
		fullName,
		phone,
		roles: roleMappings,
		role: roleMappings[0]?.code ?? "USER",
		permissions: permissionMappings,
		menu: convertFlatToTree(DB_MENU),
		createdAt,
		updatedAt,
	};
};

const login = http.post(`/api${UserApi.Login}`, async ({ request }) => {
	const { email, password } = (await request.json()) as Record<string, string>;
	const user = DB_USER.find((item) => item.email === email || item.username === email);
	if (!user || user.password !== password) {
		return HttpResponse.json({ message: "Thông tin đăng nhập không hợp lệ." }, { status: 401 });
	}

	return HttpResponse.json({
		user: buildUserProfile(user),
		tokens: {
			accessToken: faker.string.uuid(),
			refreshToken: faker.string.uuid(),
		},
	});
});

const register = http.post(`/api${UserApi.Register}`, async ({ request }) => {
	const { email, password, fullName, phone } = (await request.json()) as Record<string, string>;
	if (!email || !password || !fullName) {
		return HttpResponse.json({ message: "Thiếu thông tin bắt buộc" }, { status: 400 });
	}
	if (DB_USER.some((item) => item.email === email)) {
		return HttpResponse.json({ message: "Email đã được sử dụng" }, { status: 400 });
	}
	const now = new Date().toISOString();
	const user = {
		id: faker.string.uuid(),
		email,
		username: email.split("@")[0],
		avatar: faker.image.avatarGitHub(),
		fullName,
		phone,
		createdAt: now,
		updatedAt: now,
		password,
	};

	return HttpResponse.json({
		user: buildUserProfile(user),
		tokens: {
			accessToken: faker.string.uuid(),
			refreshToken: faker.string.uuid(),
		},
	});
});

const refresh = http.post(`/api${UserApi.Refresh}`, async ({ request }) => {
	const { refreshToken } = (await request.json()) as Record<string, string>;
	if (!refreshToken) {
		return HttpResponse.json({ message: "Refresh token không hợp lệ" }, { status: 401 });
	}
	return HttpResponse.json({
		accessToken: faker.string.uuid(),
		refreshToken: faker.string.uuid(),
	});
});

const logout = http.post(`/api${UserApi.Logout}`, async () => {
	return HttpResponse.json({ message: "Logged out successfully" });
});

const profile = http.get(`/api${UserApi.Profile}`, async () => {
	const user = DB_USER[0];
	return HttpResponse.json(buildUserProfile(user));
});

const userList = http.get("/api/user", async () => {
	return HttpResponse.json(
		Array.from({ length: 10 }).map(() => ({
			fullname: faker.person.fullName(),
			email: faker.internet.email(),
			avatar: faker.image.avatarGitHub(),
			address: faker.location.streetAddress(),
		})),
		{
			status: 200,
		},
	);
});

export { login, register, refresh, logout, profile, userList };
