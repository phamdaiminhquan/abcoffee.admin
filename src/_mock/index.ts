import { setupWorker } from "msw/browser";
import { mockTokenExpired } from "./handlers/_demo";
import { menuList } from "./handlers/_menu";
import { reviewHandlers } from "./handlers/_reviews";
import { login, logout, profile, refresh, register, userList } from "./handlers/_user";

const handlers = [login, register, refresh, logout, profile, userList, mockTokenExpired, menuList, ...reviewHandlers];
const worker = setupWorker(...handlers);

export { worker };
