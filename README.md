# Keep Or Sweep

Keep or Sweep is like Tinder for your gallery. Everybody knows the feeling to have too many old images on their device. Nevertheless, most of us are to lazy to open the gallery app, scroll through our images and delete them. Here comes the solution. Keep or Sweep shows a random image from yor gallery for which you will judge if you want to __keep__ it or if you want to *sweep* it. This is easily done by a swipe with your finger. Swipe to the left and the image is deleted; swipe to the right and it is kept.

## Technical implementation

This project was programmed to get to know the framework [ionic](https://ionicframework.com/). The framework enables the programmer to use web technologies (e.g. HTML, JavaScript, CSS) to develope application for multiple platforms (Web, Desktop, Android, IOS). In this case, the App was only developed for Android. Therefore, some implementations are Android specific, which is why the application won't run correctly in the browser. This is mainly due to the implementation logic used to gather the images on the device. Here, a [custom plugin](./android/app/src/main/java/com/keeporsweep/starter/AndroidMediaStore/AndroidMediaStorePlugin.java) was developed that uses the [MediaStore](https://developer.android.com/reference/android/provider/MediaStore) API of the Android SDK. Nevertheless, currently only images are supported. In the future the app may be extended by the capability to also show videos. Furthermore, ionic supports the usage of frontend JavaScript frameworks (React, Angular, Vue). In the case of Keep or Sweep [Vue](https://vuejs.org/) was used with the composition API to develope the frontend of the App. 

## Source Code Structure


### [/src](./src/)


#### [/src/common](./src/common/)


#### [/src/router](./src/router/)


#### [/src/store/](./src/store/)


#### [/src/views](./src/views/)


#### [/src/theme](./src/theme/)


#### [/src/plugins/AndroidMediaStorePlugin](./src/plugins/AndroidMediaStorePlugin/)


### [./public](./public/)

### [./assets](./assets/)


### [./android](./android/)

#### [./android/app/src/main/java/com/keeporsweep/starter/AndroidMediaStore/](./android/app/src/main/java/com/keeporsweep/starter/AndroidMediaStore/)