import { PhotoFile } from '@/common/types';
import { Preferences, GetResult } from '@capacitor/preferences';

//Getter methods
export async function getImageToCheckPreference(): Promise<PhotoFile[]> {
    const imagesToCheckPreference: GetResult = await Preferences.get({key: "IMAGES_TO_CHECK"});
    const imagesToCheckValue: PhotoFile[] = JSON.parse(imagesToCheckPreference.value || "[]");

    return imagesToCheckValue;
}

export async function getDeletedImagePreference(): Promise<PhotoFile[]> {
    const deletedImagesPreference: GetResult = await Preferences.get({key: "DELETED_IMAGES"});
    const deletedImagesValue: PhotoFile[] = JSON.parse(deletedImagesPreference.value || "[]");

    return deletedImagesValue;
}

export async function getKeepedImagePreference(): Promise<PhotoFile[]> {
    const keepedImagesPreference: GetResult = await Preferences.get({key: "KEEPED_IMAGES"});
    const keepedImagesValue: PhotoFile[] = JSON.parse(keepedImagesPreference.value || "[]");

    return keepedImagesValue;
}

export async function removeImageFromToCheckPreference(image: PhotoFile): Promise<PhotoFile[]> {
    let imagesToCheckValue = await getImageToCheckPreference();

    imagesToCheckValue = imagesToCheckValue.filter((obj) => {
        return obj.Data != image.Data;
    });

    Preferences.set({
        key: "IMAGES_TO_CHECK",
        value: JSON.stringify(imagesToCheckValue)
    });

    return imagesToCheckValue;
}

export async function addImageFromToCheckPreference(image: PhotoFile): Promise<void>  {

    const toCheckImagesValues: PhotoFile[] = await getImageToCheckPreference();

    toCheckImagesValues.push(image);

    Preferences.set({
        key: "IMAGES_TO_CHECK",
        value: JSON.stringify(toCheckImagesValues)
    });
}

export async function removeImageFromKeepPreference(image: PhotoFile): Promise<PhotoFile[]> {
    let imagesKeepValue = await getKeepedImagePreference();

    imagesKeepValue = imagesKeepValue.filter((obj) => {
        return obj.Data != image.Data;
    });

    Preferences.set({
        key: "KEEPED_IMAGES",
        value: JSON.stringify(imagesKeepValue)
    })

    return imagesKeepValue;
}

export async function removeImageFromSweepPreference(image: PhotoFile): Promise<PhotoFile[]> {
    let imagesSweepValue = await getDeletedImagePreference();

    imagesSweepValue = imagesSweepValue.filter((obj) => {
        return obj.Data != image.Data;
    });

    Preferences.set({
        key: "DELETED_IMAGES",
        value: JSON.stringify(imagesSweepValue)
    })

    return imagesSweepValue;
}

export async function resetImageFromSweepPreference(): Promise<void> {
    let deletedImagesCount = parseInt((await Preferences.get({key: "DELETED_IMAGES_COUNT"})).value!)

    if (isNaN(deletedImagesCount)) {
        deletedImagesCount = 0;
    }
    
    Preferences.set({
        key: "DELETED_IMAGES_COUNT",
        value: ""+ (deletedImagesCount + (await getDeletedImagePreference()).length)
    });
    
    Preferences.remove({key: "DELETED_IMAGES"}); 
}

export async function keepImageStoreHandler(image: PhotoFile): Promise<PhotoFile[]>  {

    const keepedImagesValues: PhotoFile[] = await getKeepedImagePreference();

    keepedImagesValues.push(image);

    Preferences.set({
        key: "KEEPED_IMAGES",
        value: JSON.stringify(keepedImagesValues)
    });

    return await removeImageFromToCheckPreference(image);
}

export async function deleteImageStoreHandler(image: PhotoFile): Promise<PhotoFile[]>  {
    const deletedImagesValues: PhotoFile[] = await getDeletedImagePreference();

    deletedImagesValues.push(image);

    Preferences.set({
        key: "DELETED_IMAGES",
        value: JSON.stringify(deletedImagesValues)
    });

    return await removeImageFromToCheckPreference(image);
}
