import { PhotoFile, SwipedPhotoFile, SwipedStack } from "./types";
import { removeImageFromSweepPreference, removeImageFromKeepPreference, addImageFromToCheckPreference } from '@/store';

import { Capacitor } from '@capacitor/core';

export class PhotoCache {

    photosToCheckCache: PhotoFile[] = [];
    imageCache = [new Image(), new Image(), new Image()];
    swipedImagesStack: SwipedPhotoFile[] = [];
    swipedImageCache = [new Image(), new Image(), new Image()];

    //Initialize cache on creation
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

    getSwipedImageStack(): SwipedPhotoFile[] {
        return this.swipedImagesStack;
    }

    // Update the cache if a swipe happend and put the swiped image on the swiped Image stack
    updateCache(photosToCheck: PhotoFile[], direction: SwipedStack): void {
        if (this.photosToCheckCache.length != 0) {
            this.addToUndoCache(this.photosToCheckCache[0], direction);
            this.photosToCheckCache.shift();
            this.imageCache.shift();
        }

        // If more images in the images to check preference add a new image to the cache
        if(this.cleanPhotosToCheckFromCache(photosToCheck).length != 0) {
            this.photosToCheckCache[2] = this.getUncheckedImageForCache(photosToCheck);
            this.imageCache[2] = new Image();
            this.imageCache[2].src = Capacitor.convertFileSrc(this.photosToCheckCache[2].URI);
        }
    }

    private addToUndoCache(photo: PhotoFile, direction: SwipedStack): void {
        const undoCache = {
            PhotoFile: photo,
            Stack: direction
        }

        this.swipedImagesStack.push(undoCache);
        this.swipedImageCache.shift();
        this.swipedImageCache.push(new Image());
        this.swipedImageCache[2].src = Capacitor.convertFileSrc(photo.URI);
    }

    // Get a random image from the images to check preference
    private getUncheckedImageForCache(photosToCheck: PhotoFile[]): PhotoFile {
        const cleanPhotosToCheck = this.cleanPhotosToCheckFromCache(photosToCheck);

        return cleanPhotosToCheck[Math.floor(Math.random() * (photosToCheck.length - this.photosToCheckCache.length))];

    }

    // Only return images that need to be checked but are not already in the Cache
    private cleanPhotosToCheckFromCache(photosToCheck: PhotoFile[]): PhotoFile[] {
        photosToCheck = photosToCheck.filter((obj) => {
            return !this.photosToCheckCache.map((photo) => {
                return photo.Data;
            }).includes(obj.Data)
        });

        return photosToCheck;
    }

    // If the Undo button was pressed revert the images from the cache
    revertCache(): SwipedStack | undefined {
        if (this.swipedImagesStack.length > 0) {
            // Get the last elements from the stacks for swiped photos and their loaded elements in cache
            const tempCachedPhoto = this.swipedImagesStack.pop();
            const tempImage = this.swipedImageCache.pop();
            
            // Add new loaded photo to swipedImageCache
            this.swipedImageCache.unshift(new Image());
            if (this.swipedImagesStack.length >= 3) {
                this.swipedImageCache[0].src = Capacitor.convertFileSrc(this.swipedImagesStack[this.swipedImagesStack.length - 3].PhotoFile.URI);
            }

            // Update preferences
            if (tempCachedPhoto?.Stack == SwipedStack.Keep) {
                removeImageFromKeepPreference(tempCachedPhoto.PhotoFile);
            }
            else if (tempCachedPhoto?.Stack == SwipedStack.Sweep) {
                removeImageFromSweepPreference(tempCachedPhoto.PhotoFile);
            }

            addImageFromToCheckPreference(tempCachedPhoto!.PhotoFile);

            // Update current non swiped cache
            if (this.photosToCheckCache.length >= 3) {
                this.photosToCheckCache.pop();
            }
            this.photosToCheckCache.unshift(tempCachedPhoto!.PhotoFile);

            if (this.imageCache.length >= 3) {
                this.imageCache.pop();
            }
            this.imageCache.unshift(tempImage!);

            return tempCachedPhoto?.Stack;
        }
        return;
    }
}

