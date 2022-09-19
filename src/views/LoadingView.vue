<template>
    <div class="grid_container">
        <div class="logo_container">
            <img src="/assets/icon/icon.png"/>
        </div>
        <div class="status_container">
            {{ currentStatus }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, defineEmits, ref } from '@vue/runtime-core';
import { GetResult, Preferences } from '@capacitor/preferences';
import { AndroidPermissions } from "@awesome-cordova-plugins/android-permissions";

import AndroidMediaStore from '../plugins/AndroidMediaStorePlugin';
import { PhotoFile } from '@/common/types';
import { getImageToCheckPreference, getDeletedImagePreference, getKeepedImagePreference } from "@/store";

const props = defineProps(['isLoading']);
const emit = defineEmits(['finishedLoading']);

const currentStatus = ref("Requesting permissions");

async function checkForImages() {
    let currentPhotosToCheckPreferenceValues: PhotoFile[] = await getImageToCheckPreference();
    let deletedImagesPreferenceValues: PhotoFile[] = await getDeletedImagePreference();
    let keepedImagesPreferenceValues: PhotoFile[] = await getKeepedImagePreference();

    let images: PhotoFile[];
    images = JSON.parse((await AndroidMediaStore.getAllImageURIs()).value);

    images = images.filter((image) => {
       return !deletedImagesPreferenceValues.map((currentPhoto) => {
            return currentPhoto.Data;
        }).includes(image.Data);
    });

    images = images.filter((image) => {
       return !keepedImagesPreferenceValues.map((currentPhoto) => {
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
}

onMounted(async () => {
    //TODO: Add the same logic for accepted images
    document.addEventListener('deviceready', async () => {
        const permissions: string[] = [
            "READ_EXTERNAL_STORAGE",
            "WRITE_EXTERNAL_STORAGE"
        ]

        await AndroidPermissions.checkPermission(AndroidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
         .then(
            async result => {
                if (!result.hasPermission) {

                    AndroidPermissions.requestPermissions([
                        AndroidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
                        AndroidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
                    ]).then(
                        result => {
                            if (result.hasPermission) {
                                currentStatus.value = "Searching for images";
                                checkForImages();
                            }
                            else {
                                currentStatus.value = "Permissions denied! To continue allow the file access in the App settings.";
                            }
                        }
                    )
                }
                else {
                    checkForImages();
                }
            },
            err => { 
                currentStatus.value = "Permissions denied! To continue, allow the file access in the App setting.";
            }
         )
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
    padding-left: 10px;
    padding-right: 10px;
    text-align: center;
}
</style>
