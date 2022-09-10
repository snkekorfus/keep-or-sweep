import type { PluginListenerHandle } from "@capacitor/core";

export interface AndroidMediaStorePlugin {

    getAllImageURIs(): Promise<{value: string}>;

    createTrashRequest(options: {URI: string}): Promise<void>;

}