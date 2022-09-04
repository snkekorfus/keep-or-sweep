
<template>
    <div class="center_container">
        <div class="image_container" ref="image_container">
            <img :src="fixedPhotoUri">
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineExpose, onBeforeMount } from '@vue/runtime-core';
import { createAnimation, Animation } from '@ionic/vue';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

defineExpose({ setNewImage, deleteImage, keepImage });

const fixedPhotoUri = ref<string | null>(null);
const photosToCheck = ref<string[]>([]);

let photoToCheck: string[] = [];
const imageCache = [new Image(), new Image(), new Image()];
let cachePosition = 0;

function setNewImage(deleted: boolean) {
    console.log("setNewImage called");
    fixedPhotoUri.value = imageCache[cachePosition].src;

    updateCache();
    
    comeUpAnimation!.play();
    if (deleted) {
        leftSwipeAnimation!.stop();
    }
    else {
        rightSwipeAnimation?.stop();
    }
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

function deleteImage() {
    leftSwipeAnimation!.play();
}

function keepImage() {
    rightSwipeAnimation!.play();
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

// Define Animations
const image_container = ref(null);
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

let leftSwipeAnimation: Animation | null = null;
let rightSwipeAnimation: Animation | null = null;
let comeUpAnimation: Animation | null = null;

onMounted(() => {
    leftSwipeAnimation = createAnimation() 
        .addElement(image_container.value)
        .duration(200)
        .iterations(1)
        .fromTo("transform", "translateX(0px)", `translateX(-${windowWidth * 1.5}px) rotate(-20deg)`)
        .onFinish(() => setNewImage(true))

    rightSwipeAnimation = createAnimation() 
        .addElement(image_container.value)
        .duration(200)
        .iterations(1)
        .fromTo("transform", "translateX(0px)", `translateX(${windowWidth * 1.5}px) rotate(20deg)`)
        .onFinish(() => setNewImage(false))

    comeUpAnimation = createAnimation()
        .addElement(image_container.value)
        .duration(200)
        .iterations(1)
        .fromTo("transform", `translateY(${windowHeight * 1.5}px)`, `translateY(0px)`)
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