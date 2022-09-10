import { PhotoFile } from "./types";

import { Capacitor } from '@capacitor/core';

export class PhotoCache {

    photosToCheckCache: PhotoFile[] = [];
    imageCache = [new Image(), new Image(), new Image()];
    cachePosition = 0;
    swipedImagesStack: PhotoFile[] = [];


    constructor(photosToCheck: PhotoFile[]) {
        while (this.photosToCheckCache.length < 3 && this.cleanPhotosToCheckFromCache(photosToCheck).length != 0) {
            this.photosToCheckCache[this.photosToCheckCache.length] = this.getUncheckedImageForCache(photosToCheck);
        }
    
        for (const photo in this.photosToCheckCache){
            this.imageCache[photo].src = Capacitor.convertFileSrc(this.photosToCheckCache[photo].Data);
        }
    }

    getCurrentPhotoFile(): PhotoFile {
        return this.photosToCheckCache[0];
    }

    getCachedPhoto(): string {
        return this.imageCache[0].src;
    }

    // TODO: Add swiped image to swipedImagesStack
    updateCache(photosToCheck: PhotoFile[]): void {
        if (this.photosToCheckCache.length != 0) {
            this.swipedImagesStack.push(this.photosToCheckCache[0]);
            this.photosToCheckCache.shift();
            this.imageCache.shift();
        }

        if(this.cleanPhotosToCheckFromCache(photosToCheck).length != 0) {
            this.photosToCheckCache[2] = this.getUncheckedImageForCache(photosToCheck);
            this.imageCache[2] = new Image();
            this.imageCache[2].src = Capacitor.convertFileSrc(this.photosToCheckCache[2].URI);
        }
    }

    private getUncheckedImageForCache(photosToCheck: PhotoFile[]): PhotoFile {
        const cleanPhotosToCheck = this.cleanPhotosToCheckFromCache(photosToCheck);

        return cleanPhotosToCheck[Math.floor(Math.random() * (photosToCheck.length - this.photosToCheckCache.length))];

    }

    private cleanPhotosToCheckFromCache(photosToCheck: PhotoFile[]): PhotoFile[] {
        photosToCheck = photosToCheck.filter((obj) => {
            return !this.photosToCheckCache.map((photo) => {
                return photo.Data;
            }).includes(obj.Data)
        });

        return photosToCheck;
    }

    revertCache(): void {
        return;
    }
}

