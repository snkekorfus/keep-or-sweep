
<template>
    <div class="center_container">
        <div class="image_container" ref="image_container">
            <img :src="fixedPhotoUri">
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineExpose, onBeforeMount, defineEmits } from '@vue/runtime-core';
import { createAnimation, Animation, AnimationDirection, AnimationCallbackOptions, createGesture, GestureDetail } from '@ionic/vue';

import { getImageToCheckPreference, deleteImageStoreHandler, keepImageStoreHandler } from '../store';

import { PhotoFile, SwipedStack } from '@/common/types';
import { PhotoCache } from '@/common/PhotoCache';

defineExpose({ setNewImage, deleteImage, keepImage, undoSwipe,resetUndoCache });
const emit = defineEmits(["cleanedUp", "lastSwipe", "swiped", "noMoreUndos", "undoLastSwipe", "undoCleanedUp"]);

// The file path to the currently shown image
const fixedPhotoUri = ref<string | null>(null);

// The instance of a photo_cache used throughout the component
let photo_cache: PhotoCache;

// Add image to the sweep image preference
// Update the cache and if neccessary play the rightSwipeAnimation
// Furthermore trigger the setNewImage function
async function deleteImage(buttonPressed: boolean) {

    const photosToCheck: PhotoFile[] = await deleteImageStoreHandler(photo_cache.getCurrentPhotoFile());

    photo_cache.updateCache(photosToCheck, SwipedStack.Sweep);
    
    if (buttonPressed) {
        leftSwipeAnimation!
            .direction("normal")
            .onFinish(() => { setNewImage(true) }, callbackOptions)    
            .play();
    } else {
        setNewImage(true);
    }
}

// Add image to the keep image preference
// Update the cache and if neccessary play the rightSwipeAnimation
// Furthermore trigger the setNewImage function
async function keepImage(buttonPressed: boolean) {

    const photosToCheck: PhotoFile[] = await keepImageStoreHandler(photo_cache.getCurrentPhotoFile());

    photo_cache.updateCache(photosToCheck, SwipedStack.Keep);

    if (buttonPressed) {
        rightSwipeAnimation!
            .direction("normal")
            .onFinish(() => { setNewImage(false) }, callbackOptions)
            .play();
    } else {
        setNewImage(false);
    }
}

// Set a new image in the image view and play the animation that
// brings the new image to the view
function setNewImage(deleted: boolean) {
    if (photo_cache.getSwipedImageStack().length > 0) {
        emit("swiped");
    }
    
    if (photo_cache.photosToCheckCache.length == 0) {
        emit("lastSwipe");
        return;
    }

    fixedPhotoUri.value = photo_cache.getCachedPhoto();

    comeUpAnimation!
        .direction("normal")
        .stop();
    comeUpAnimation!
        .onFinish(() => {
            if (photo_cache.photosToCheckCache.length == 1) {
                emit("cleanedUp");
            }
            if (deleted) {
                leftSwipeAnimation!.stop();
            }
            else {
                rightSwipeAnimation!.stop();
            }
        }, callbackOptions)
        .play();
}

// Undo a keep or sweep Swipe by restoring a swiped picture from the cache
// Reverse all the animations that happened before
// If neccessary remove the no more images view
function undoSwipe(): void {
    const swipeStack: SwipedStack  = photo_cache.revertCache();

    if (photo_cache.photosToCheckCache.length != 1) {
        comeUpAnimation
        .direction("reverse")
        .stop()

        comeUpAnimation
            .onFinish(() => {
                fixedPhotoUri.value = photo_cache.getCachedPhoto();
                undoSwipeHelper(swipeStack);
            }, callbackOptions)
            .play();
    }
    else {
        undoSwipeHelper(swipeStack);
        emit("undoLastSwipe");
    }

    if (photo_cache.photosToCheckCache.length == 2) {
        emit("undoCleanedUp");
    }

    if (photo_cache.getSwipedImageStack().length == 0) {
        emit("noMoreUndos");
    }
}

// On undo play the swipe animation reverse
function undoSwipeHelper(swipeStack: SwipedStack): void {
    if (swipeStack == SwipedStack.Keep) {
        rightSwipeAnimation
            .direction("reverse")
            .onFinish(() => {
                rightSwipeAnimation
                    .direction("normal")
                    .stop();
            }, callbackOptions)
            .play();
    }
    else if (swipeStack == SwipedStack.Sweep) {
        leftSwipeAnimation
            .direction("reverse")
            .onFinish(() => {
                leftSwipeAnimation
                    .direction("normal")
                    .stop();
            }, callbackOptions)
            .play();
    }
}

function resetUndoCache(): void {
    photo_cache.resetCache();
}

onBeforeMount(async () => {
    const photosToCheck: PhotoFile[] = await getImageToCheckPreference();

    photo_cache = new PhotoCache(photosToCheck);

    if (photo_cache.photosToCheckCache.length != 0) {
        fixedPhotoUri.value = photo_cache.getCachedPhoto();
    }
});


// Animation handling

// Define Animations and gestures
const image_container = ref(null);
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;
let started = false;
let direction: boolean | null = null;

// Used to disable the onFinish of the animations
const callbackOptions: AnimationCallbackOptions = {
                oneTimeCallback: true,
            }

let leftSwipeAnimation: Animation = createAnimation() 
    .duration(200)
    .iterations(1)
    .fromTo("transform", "translateX(0px)", `translateX(-${windowWidth * 1.5}px) rotate(-20deg)`)

let rightSwipeAnimation: Animation = createAnimation() 
    .duration(200)
    .iterations(1)
    .fromTo("transform", "translateX(0px)", `translateX(${windowWidth * 1.5}px) rotate(20deg)`)
  
let comeUpAnimation: Animation = createAnimation()
    .duration(200)
    .iterations(1)
    .fromTo("transform", `translateY(${windowHeight * 1.5}px)`, `translateY(0px)`);

onMounted(() => {
    leftSwipeAnimation = leftSwipeAnimation.addElement(image_container.value);

    rightSwipeAnimation = rightSwipeAnimation.addElement(image_container.value);

    comeUpAnimation = comeUpAnimation.addElement(image_container.value);

    const swipeGesture = createGesture({
        el: image_container.value,
        onMove: (detail) => {
            if (!started) {
                started = true;
            }
            if (direction == null && detail.deltaX < 0) {
                direction = false;
                leftSwipeAnimation!.progressStart();
            }
            else if (direction == null && detail.deltaX > 0) {
                direction = true;
                rightSwipeAnimation!.progressStart();
            }
            else if (!direction && detail.deltaX > 0) {
                leftSwipeAnimation!.progressEnd(0, 0);
                leftSwipeAnimation!.stop();
                direction = null;
            }
            else if (direction && detail.deltaX < 0) {
                rightSwipeAnimation!.progressEnd(0, 0);
                rightSwipeAnimation!.stop();
                direction = null;
            }
            else if (!direction && detail.deltaX < 0) {
                leftSwipeAnimation!.progressStep(getStep(detail, direction));
            }
            else if (direction && detail.deltaX > 0) {
                rightSwipeAnimation!.progressStep(getStep(detail, direction));
            }
        
        },
        onEnd: (detail) => {
            if (!started) { return; }
            
            swipeGesture.enable(false);

            const step = getStep(detail, direction!);
            const shouldComplete = step > 0.35;

            if (!direction) {
                leftSwipeAnimation!
                    .direction("normal")
                    .progressEnd((shouldComplete) ? 1 : 0, step)
                    .onFinish(() => { 
                        if (shouldComplete) {
                            deleteImage(false);
                        } else {
                            leftSwipeAnimation!.stop();
                        }
                        swipeGesture.enable(true);
                    }, callbackOptions);
            }
            else if (direction) {
                rightSwipeAnimation!
                    .direction("normal")
                    .progressEnd((shouldComplete) ? 1 : 0, step)
                    .onFinish(() => { 
                        if (shouldComplete) {
                            keepImage(false);
                        } else {
                            rightSwipeAnimation!.stop();
                        }
                        swipeGesture.enable(true);
                    }, callbackOptions);
                
            }

            started = false;
            direction = null;
        }
    });

    swipeGesture.enable(true);
});

// Helper for animation
function getStep(detail: GestureDetail, direction: boolean): number {
    if (direction){
        return Math.max(0, Math.min(detail.deltaX / windowWidth, 1));
    }
    return Math.max(0, Math.min((detail.deltaX * -1) / windowWidth, 1));    
}

</script>

<style scoped>

.center_container {
    display: flex;
    position: relative;
    height: calc(100% - 100px);
    margin-top: 10px;
    width: 95%;
    left: 2.5%;
    align-items: center;
}

.image_container {
    position: relative;
    overflow: hidden;
    border-radius: 5px;
    width: 100%;
    max-height: 100%;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}

.image_container img {
    display: block;
    width: 100%;
    object-fit: cover;
}

</style>