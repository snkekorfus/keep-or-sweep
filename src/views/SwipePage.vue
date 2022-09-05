<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Keep or Sweep 🧹</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content scroll-y="false">
            <image-view ref="imageView" />
            <ion-fab slot="fixed" vertical="bottom" horizontal="start">
                <ion-fab-button color="danger" @click="deleteImage">
                    <ion-icon :icon="trash" size="large"></ion-icon>
                </ion-fab-button>
            </ion-fab>
            <ion-fab slot="fixed" vertical="bottom" horizontal="end">
                <ion-fab-button color="success" @click="keepImage">
                    <ion-icon :icon="heart" size="large"></ion-icon>
                </ion-fab-button>
            </ion-fab>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { ref } from '@vue/runtime-core';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonFab, IonFabButton, IonIcon } from '@ionic/vue';
import { heart, trash } from "ionicons/icons";
import ImageView from "./ImageView.vue";

const imageView = ref();

function deleteImage() {
    imageView.value.deleteImage(true);
}

function keepImage() {
    imageView.value.keepImage(true);
}

</script>

<style scoped>

</style>