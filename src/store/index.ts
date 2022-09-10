import { PhotoFile } from '@/common/types';
import { Preferences, GetResult } from '@capacitor/preferences';


export async function getImageToCheckPreference(): Promise<PhotoFile[]> {
    const imagesToCheckPreference: GetResult = await Preferences.get({key: "IMAGES_TO_CHECK"});
    const imagesToCheckValue: PhotoFile[] = JSON.parse(imagesToCheckPreference.value || "[]");

    return imagesToCheckValue;
}

export async function removeImageFromToCheckPreference(image: PhotoFile): Promise<PhotoFile[]> {
    let imagesToCheckValue = await getImageToCheckPreference();

    imagesToCheckValue = imagesToCheckValue.filter((obj) => {
        return obj.Data != image.Data;
    });

    console.log(imagesToCheckValue);

    Preferences.set({
        key: "IMAGES_TO_CHECK",
        value: JSON.stringify(imagesToCheckValue)
    })

    return imagesToCheckValue;
}

export async function getDeletedImagePreference(): Promise<PhotoFile[]> {
    const deletedImagesPreference: GetResult = await Preferences.get({key: "DELETE_IMAGES"});
    const deletedImagesValue: PhotoFile[] = JSON.parse(deletedImagesPreference.value || "[]");

    return deletedImagesValue;
}

export async function deleteImageStoreHandler(image: PhotoFile): Promise<PhotoFile[]>  {

    const deletedImagesPreferences: GetResult = await Preferences.get({key: "DELETE_IMAGES"});
    let deletedImagesValues: PhotoFile[] = JSON.parse(deletedImagesPreferences.value || "[]");

    deletedImagesValues = deletedImagesValues.concat(image);

    console.log(deletedImagesValues);

    Preferences.set({
        key: "DELETE_IMAGES",
        value: JSON.stringify(deletedImagesValues)
    });

    return await removeImageFromToCheckPreference(image);
}
