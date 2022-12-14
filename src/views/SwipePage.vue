<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Keep or Sweep 🧹</ion-title>
                <ion-buttons slot="end">
                    <ion-button router-link="/info">
                        <ion-icon slot="icon-only" :icon="informationCircleOutline"></ion-icon>
                    </ion-button>
                    <ion-button @click="callTrashRequest">
                        <ion-icon slot="icon-only" :icon="trash"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content scroll="false">
            <image-view ref="imageView" class="image_view" @cleaned-up="cleanedUp = true" @undo-cleaned-up="cleanedUp = false" @last-swipe="showButtons = false" @undo-last-swipe="showButtons = true" @swiped="canUndo = true" @no-more-undos="canUndo = false"/>
            <div class="finished_container" v-if="cleanedUp">
                <div class="logo_container">
                    <img src="/assets/icon/icon.png"/>
                </div>
                <div class="status_container">
                    You cleaned up! Reset and startover!
                </div>
            </div>

            <Transition name="swipe-button">
                <ion-fab slot="fixed" vertical="bottom" horizontal="start" v-if="showButtons">
                    <ion-fab-button color="danger" @click="deleteImage" id="sweepButton">
                        <ion-icon :icon="trash" size="large"></ion-icon>
                    </ion-fab-button>
                </ion-fab>
            </Transition>

            <div class="undoButtonContainer">
                <Transition name="bounce">
                    <ion-button shape="round" color="tertiary" @click="undoSwipe" v-if="canUndo">
                        <ion-icon slot="start" :icon="reloadOutline" size="large"></ion-icon>
                        Undo
                    </ion-button>
                </Transition>
            </div>

            <Transition name="swipe-button">
                <ion-fab slot="fixed" vertical="bottom" horizontal="end"  v-if="showButtons">
                    <ion-fab-button color="success" @click="keepImage" id="keepButton">
                        <ion-icon :icon="heart" size="large"></ion-icon>
                    </ion-fab-button>
                </ion-fab>
            </Transition>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from '@vue/runtime-core';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonFab, IonFabButton, IonButton, IonButtons, IonIcon, createAnimation, Animation } from '@ionic/vue';
import { heart, trash, reloadOutline, informationCircleOutline } from "ionicons/icons";
import ImageView from "./ImageView.vue";
import { PhotoFile } from '@/common/types';
import { getImageToCheckPreference, getDeletedImagePreference, resetImageFromSweepPreference } from '@/store';
import AndroidMediaStore from '@/plugins/AndroidMediaStorePlugin';
import { App, AppState } from '@capacitor/app';

const imageView = ref();
const cleanedUp = ref(true);
const showButtons = ref(false)
const canUndo = ref(false)

function deleteImage(): void {
    imageView.value.deleteImage(true);
}

function keepImage(): void {
    imageView.value.keepImage(true);
}

function undoSwipe(): void {
    imageView.value.undoSwipe();
}

async function callTrashRequest() {
    const deletedImages: PhotoFile[] = await getDeletedImagePreference();

    if (deletedImages.length == 0) {return;}

    const URIs = deletedImages.map((image) => {
        return image.URI;
    });

    await App.addListener("appStateChange", resumeAfterTrashRequest);

    const result: string = (await AndroidMediaStore.createTrashRequest({URIs: URIs})).value;

}

// TODO: RESET CACHE
async function resumeAfterTrashRequest(state: AppState) {
    if (state.isActive) {
        let images: PhotoFile[];
        images = JSON.parse((await AndroidMediaStore.getAllImageURIs()).value);
        const deletedImages: PhotoFile[] = await getDeletedImagePreference();

        images = images.filter((image) => {
            return deletedImages.map((deletedImage) => {
                return deletedImage.Data;
            }).includes(image.Data);
        });

        if (images.length == 0) {
            resetImageFromSweepPreference();
            canUndo.value = false;
            imageView.value.resetUndoCache();
        }

        App.removeAllListeners();
    }
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

.undoButtonContainer {
    z-index: 3;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    bottom: 10px;
    width: 100%;
    height: 56px;
}

.swipe-button-leave-active {
    animation: bounce-in 0.35s reverse;
}

.swipe-button-enter-active {
    animation: bounce-in 0.35s;
}

.bounce-enter-active {
  animation: bounce-in 0.35s;
}
.bounce-leave-active {
  animation: bounce-in 0.35s reverse;
}
@keyframes bounce-in {
  0% {
    transform: translateY(130px);
  }
  20% {
    transform: translateY(-30px);
  }
  100% {
    transform: translateY(0px);
  }
}
</style>