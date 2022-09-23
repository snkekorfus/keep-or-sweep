import type { PluginListenerHandle } from "@capacitor/core";

export interface AndroidMediaStorePlugin {

    getAllImageURIs(): Promise<{value: string}>;

    createTrashRequest(options: {URIs: string[]}): Promise<{value: string}>;

}