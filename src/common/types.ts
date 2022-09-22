export interface PhotoFile {
    "Data": string,
    "URI": string,
    "Name": string
}

export interface SwipedPhotoFile {
    "PhotoFile": PhotoFile,
    "Stack": SwipedStack
}

export enum SwipedStack {
    Keep,
    Sweep
}
