import { setupWorker } from "msw/browser";
import { mockTokenExpired } from "./handlers/_demo";
import { menuList } from "./handlers/_menu";
import { reviewHandlers } from "./handlers/_reviews";

// Note: User auth handlers removed - using real backend now
const handlers = [mockTokenExpired, menuList, ...reviewHandlers];
const worker = setupWorker(...handlers);

export { worker };
