<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Keep or Sweep 🧹</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content scroll="false">
            <image-view ref="imageView" class="image_view" @cleaned-up="cleanedUp = true" @last-swipe="removeButtons"/>
            <div class="finished_container" v-if="cleanedUp">
                <div class="logo_container">
                    <img src="/assets/icon/icon.png"/>
                </div>
                <div class="status_container">
                    You cleaned up! Reset and startover!
                </div>
            </div>

            <ion-fab slot="fixed" vertical="bottom" horizontal="start" v-if="showButtons">
                <ion-fab-button color="danger" @click="deleteImage" id="sweepButton">
                    <ion-icon :icon="trash" size="large"></ion-icon>
                </ion-fab-button>
            </ion-fab>

            <ion-fab slot="fixed" vertical="bottom" horizontal="end"  v-if="showButtons">
                <ion-fab-button color="success" @click="keepImage" id="keepButton">
                    <ion-icon :icon="heart" size="large"></ion-icon>
                </ion-fab-button>
            </ion-fab>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from '@vue/runtime-core';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonFab, IonFabButton, IonIcon, createAnimation, Animation } from '@ionic/vue';
import { heart, trash } from "ionicons/icons";
import ImageView from "./ImageView.vue";
import { PhotoFile } from '@/common/types';
import { getImageToCheckPreference } from '@/store';

const imageView = ref();
const cleanedUp = ref(true);
const showButtons = ref(false)

function deleteImage(): void {
    imageView.value.deleteImage(true);
}

function keepImage(): void {
    imageView.value.keepImage(true);
}

function removeButtons(): void {
    const keepButton = document.querySelector("#keepButton");
    const sweepButton = document.querySelector("#sweepButton");
    
    let removeButtonsAnimation: Animation = createAnimation()
    .addElement(keepButton)
    .addElement(sweepButton)
    .duration(350)
    .iterations(1)
    .keyframes([
        {offset: 0, transform: 'translateY(0px)'},
        {offset: 0.2, transform: 'translateY(-30px)'},
        {offset: 1, transform: 'translateY(100px)'},
    ])
    .onFinish(() => showButtons.value = false);

    removeButtonsAnimation.play();
}

onBeforeMount(async () => {
    const photosToCheck: PhotoFile[] = await getImageToCheckPreference();

    if (photosToCheck.length != 0) {
        cleanedUp.value = false;
        showButtons.value = true;
    }
});


</script>

<style scoped>
.image_view {
    z-index: 2;
    position: relative;
}

.finished_container {
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;
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
</style>