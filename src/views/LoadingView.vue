<template>
    Hallo Moin!
</template>

<script setup lang="ts">
import { defineProps, onMounted, defineEmits } from '@vue/runtime-core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

const props = defineProps(['isLoading']);
const emit = defineEmits(['finishedLoading']);

async function getListOfImages(startDirectories: string[]): Promise<string[]> {
    var images: string[] = []

    for (let dir in startDirectories) {
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

</style>
