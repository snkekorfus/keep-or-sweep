<template>
    <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Information</ion-title>
        <ion-buttons slot="start">
            <ion-back-button default-href="swipe"></ion-back-button> 
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <p>
            Not swiped: {{ notSwiped }} <br />
            Keeped: {{ keeped }} <br />
            Deleted: {{ deleted }} <br />
            Total swipes: {{ keeped + deleted }}
        </p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton } from '@ionic/vue';
import {arrowBackOutline} from "ionicons/icons";
import { getImageToCheckPreference, getDeletedImagePreference, getKeepedImagePreference } from '@/store';
import { computed, onBeforeMount, ref } from '@vue/runtime-core';
import { Preferences } from '@capacitor/preferences';

const notSwiped = ref();
const keeped = ref();
const deleted = ref();

onBeforeMount(async () => {
    notSwiped.value = (await getImageToCheckPreference()).length;
    console.log(parseInt((await Preferences.get({key: "DELETED_IMAGES_COUNT"})).value!));
    const imagesDeletedCount = parseInt((await Preferences.get({key: "DELETED_IMAGES_COUNT"})).value!)
    deleted.value = (await getDeletedImagePreference()).length + (isNaN(imagesDeletedCount) ? 0 : imagesDeletedCount);
    keeped.value = (await getKeepedImagePreference()).length;
})

</script>

<style scoped>

</style>