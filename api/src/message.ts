import { config } from "./config";

export const getMessage = () => {
    return `Hello from ${config().APP_ID}`;
}
