import { PhotoFile } from "./types";

import { Capacitor } from '@capacitor/core';

export class PhotoCache {

    photosToCheckCache: PhotoFile[] = [];
    imageCache = [new Image(), new Image(), new Image()];
    cachePosition = 0;
    swipedImagesStack: PhotoFile[] = [];


    constructor(photosToCheck: PhotoFile[]) {
        while (this.photosToCheckCache.length < 3) {
            this.photosToCheckCache[this.photosToCheckCache.length] = photosToCheck.filter((obj) => {
                return !this.photosToCheckCache.map((photo) => {
                    return photo.uri;
                }).includes(obj.uri);
            })[Math.floor(Math.random() * (photosToCheck.length - this.photosToCheckCache.length))]
        }
    
        for (let photo in this.photosToCheckCache){
            this.imageCache[photo].src = Capacitor.convertFileSrc(this.photosToCheckCache[photo].uri);
        }
    }

    getPhoto(): string {
        return this.imageCache[this.cachePosition].src;
    }


    // TODO: Add swiped image to swipedImagesStack
    updateCache(photosToCheck: PhotoFile[]): void {
        this.swipedImagesStack.push(this.photosToCheckCache[this.cachePosition])

        this.photosToCheckCache[this.cachePosition] = photosToCheck.filter((obj) => {
            return !this.photosToCheckCache.map((photo) => {
                return photo.uri;
            }).includes(obj.uri);
        })[Math.floor(Math.random() * (photosToCheck.length - this.photosToCheckCache.length))]


        this.imageCache[this.cachePosition].src = Capacitor.convertFileSrc(this.photosToCheckCache[this.cachePosition].uri);

        if (this.cachePosition != 2) {
            this.cachePosition++;
        } else {
            this.cachePosition = 0;
        }
    }

    revertCache(): void {
        return;
    }
}

