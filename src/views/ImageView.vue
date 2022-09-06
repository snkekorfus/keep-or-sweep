
<template>
    <div class="center_container">
        <div class="image_container" ref="image_container">
            <img :src="fixedPhotoUri">
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineExpose, onBeforeMount } from '@vue/runtime-core';
import { createAnimation, Animation, AnimationCallbackOptions, createGesture, GestureDetail } from '@ionic/vue';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

defineExpose({ setNewImage, deleteImage, keepImage });

const fixedPhotoUri = ref<string | null>(null);
const photosToCheck = ref<string[]>([]);

let photoToCheck: string[] = [];
const imageCache = [new Image(), new Image(), new Image()];
let cachePosition = 0;

function setNewImage(deleted: boolean) {
    fixedPhotoUri.value = imageCache[cachePosition].src;

    updateCache();
    comeUpAnimation!.stop();
    comeUpAnimation!
        .onFinish(() => {
            if (deleted) {
                leftSwipeAnimation!.stop();
            }
            else {
                rightSwipeAnimation!.stop();
            }
        }, callbackOptions)
        .play();
}

function updateCache() {
    photoToCheck[cachePosition] = photosToCheck.value.filter((obj) => {
            return !photoToCheck.includes(obj)
        })[Math.floor(Math.random() * (photosToCheck.value.length - 2))]

    imageCache[cachePosition].src = Capacitor.convertFileSrc(photoToCheck[cachePosition]);

    if (cachePosition != 2) {
        cachePosition++;
    } 
    else {
        cachePosition = 0;
    }
}

function deleteImage(buttonPressed: boolean) {
    if (buttonPressed) {
        leftSwipeAnimation!
            .onFinish(() => { setNewImage(true) }, callbackOptions)    
            .play();
    } else {
        setNewImage(true);
    }
}

function keepImage(buttonPressed: boolean) {
    if (buttonPressed) {
        rightSwipeAnimation!
            .onFinish(() => { setNewImage(false) }, callbackOptions)
            .play();
    } else {
        setNewImage(false);
    }
}

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
            console.log("We are in the endgame now");
            if (!started) { return; }
            
            swipeGesture.enable(false);

            const step = getStep(detail, direction!);
            const shouldComplete = step > 0.35;

            if (!direction) {
                leftSwipeAnimation!
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


onBeforeMount(async () => {
    const photosToCheckPreferenceValue = await Preferences.get({ key: 'PHOTOS_TO_CHECK' });
    photosToCheck.value = JSON.parse(photosToCheckPreferenceValue.value || '[]');

    while (photoToCheck.length < 3) {
        photoToCheck[photoToCheck.length] = photosToCheck.value.filter((obj) => {
            return !photoToCheck.includes(obj)
        })[Math.floor(Math.random() * (photosToCheck.value.length - photoToCheck.length))]
    }

    for (let photo in photoToCheck){
        imageCache[photo].src = Capacitor.convertFileSrc(photoToCheck[photo]);
    }

    fixedPhotoUri.value = imageCache[0].src;

    updateCache();
});

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