import { registerPlugin } from "@capacitor/core";

import type { AndroidMediaStorePlugin } from "./definitions";

const AndroidMediaStore = registerPlugin<AndroidMediaStorePlugin>("AndroidMediaStore");

export default AndroidMediaStore;