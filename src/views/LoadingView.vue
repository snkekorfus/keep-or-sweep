<template>
    <div class="grid_container">
        <div class="logo_container">
            <img src="/assets/icon/icon.png"/>
        </div>
        <div class="status_container">
            Searching for images
        </div>
        <div class="status_container">
            {{ currentDirectory }}
        </div> 
    </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, defineEmits, ref } from '@vue/runtime-core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

import { IonCol, IonGrid, IonRow } from '@ionic/vue';

const props = defineProps(['isLoading']);
const emit = defineEmits(['finishedLoading']);
const currentDirectory = ref("")

async function getListOfImages(startDirectories: string[]): Promise<string[]> {
    var images: string[] = []

    for (let dir in startDirectories) {
        setDirectoryString(startDirectories[dir]);
        try {
            let content = await Filesystem.readdir({
                path: startDirectories[dir],
                directory: Directory.ExternalStorage
            });

        let directories = content.files.filter((obj) => {
            return obj.type === "directory";
        });

        let nextDirectories = directories.map((obj) => {
            return startDirectories[dir] + "/" + obj.name;
        });

        if (directories.length != 0) {
            let tempImages = await getListOfImages(nextDirectories);
            images.push(...tempImages);
        }

        let files = content.files.filter((obj) => {
            return obj.type === "file" && /.*\.(jpg|png|gif|jpeg|webp)/.test(obj.name);
        });

        images.push(...files.map((file) => {
            return file.uri;
        }));
        } catch (error) {
            console.log("Error for dir: " + dir)
        }
    }

    return images
}

function setDirectoryString(dir: string) {
    console.log(dir.length);
    if (dir.length <= 30) {
        currentDirectory.value = dir;
        return;
    }
    currentDirectory.value = "..." + dir.slice(dir.length - 30, dir.length);
}

onMounted(async () => {
    let images = await getListOfImages(["Android", "Pictures", "DCIM", "Download"]);

    const currentPhotosToCheckPreference = await Preferences.get({ key: 'PHOTOS_TO_CHECK' });
    let currentPhotosToCheckPreferenceValues = JSON.parse(currentPhotosToCheckPreference.value || "[]");

    images = images.filter((image) => {
        return !currentPhotosToCheckPreferenceValues.includes(image);
    });

    currentPhotosToCheckPreferenceValues = currentPhotosToCheckPreferenceValues.concat(images);

    Preferences.set({
        key: 'PHOTOS_TO_CHECK',
        value: JSON.stringify(currentPhotosToCheckPreferenceValues)
    });

    emit('finishedLoading');
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
