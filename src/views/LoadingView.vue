<template>
    <div class="grid_container">
        <div class="logo_container">
            <img src="/assets/icon/icon.png"/>
        </div>
        <div class="status_container">
            Searching for images
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, defineEmits } from '@vue/runtime-core';
import { GetResult, Preferences } from '@capacitor/preferences';

import AndroidMediaStore from '../plugins/AndroidMediaStorePlugin';
import { PhotoFile } from '@/common/types';
import { getImageToCheckPreference, getDeletedImagePreference } from "@/store";

const props = defineProps(['isLoading']);
const emit = defineEmits(['finishedLoading']);


onMounted(async () => {
    //TODO: Add the same logic for accepted images
    document.addEventListener('deviceready', async () => {

        let currentPhotosToCheckPreferenceValues: PhotoFile[] = await getImageToCheckPreference();
        let deletedImagesPreferenceValues: PhotoFile[] = await getDeletedImagePreference();

        let images: PhotoFile[];
        images = JSON.parse((await AndroidMediaStore.getAllImageURIs()).value);

        images = images.filter((image) => {
           return !deletedImagesPreferenceValues.map((currentPhoto) => {
                return currentPhoto.Data;
            }).includes(image.Data);
        });

        images = images.filter((image) => {
           return !currentPhotosToCheckPreferenceValues.map((currentPhoto) => {
                return currentPhoto.Data;
            }).includes(image.Data);
        });

        currentPhotosToCheckPreferenceValues = currentPhotosToCheckPreferenceValues.concat(images);

        Preferences.set({
            key: 'IMAGES_TO_CHECK',
            value: JSON.stringify(currentPhotosToCheckPreferenceValues)
        });

        emit('finishedLoading');
    });
});
</script>

<style scoped>
.grid_container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 90%;
}

.logo_container {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
}

.logo_container img {
    width: 50%;
    align-self: center;
}

.status_container {
    display: flex;
    justify-content: center;
}

.test {
    border: 1px solid red;
}
</style>
