package com.keeporsweep.starter.AndroidMediaStore;

import android.Manifest;
import android.app.PendingIntent;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.Intent;
import android.content.IntentSender;
import android.database.Cursor;
import android.net.Uri;
import android.provider.MediaStore;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.json.JSONException;

import java.sql.Array;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CapacitorPlugin(
        name = "AndroidMediaStore",
        permissions = {
                @Permission(
                        alias = "storage",
                        strings = {
                                Manifest.permission.READ_EXTERNAL_STORAGE,
                                Manifest.permission.WRITE_EXTERNAL_STORAGE
                        }
                )
        })
public class AndroidMediaStorePlugin extends Plugin {

    @PluginMethod()
    public void getAllImageURIs(PluginCall call) {
        List<Map<String, String>> images = new ArrayList<Map<String, String>>();

        ContentResolver contentResolver = this.getActivity().getContentResolver();

        String[] columns = {MediaStore.Images.ImageColumns._ID, MediaStore.Images.ImageColumns.DISPLAY_NAME, MediaStore.Images.ImageColumns.DATA};

        Cursor cursor = contentResolver.query(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, columns, null, null, null);

        int idColumn = cursor.getColumnIndex(MediaStore.Images.Media._ID);
        int nameColumn = cursor.getColumnIndex(MediaStore.Images.Media.DISPLAY_NAME);
        int dataColumn = cursor.getColumnIndex(MediaStore.Images.Media.DATA);

        while (cursor.moveToNext()) {
            Long id = cursor.getLong(idColumn);
            String URI = ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id).toString();
            String name = cursor.getString(nameColumn);
            String data = cursor.getString(dataColumn);

            Map<String,String> temp = new HashMap<String, String>();
            temp.put("URI", URI);
            temp.put("Name", name);
            temp.put("Data", data);

            images.add(temp);
        }

        //String[] uriArray = new String[ URIs.size() ];
        //URIs.toArray(uriArray);

        Gson gson = new GsonBuilder().create();
        String jsonArray = gson.toJson(images);

        JSObject ret = new JSObject();
        ret.put("value", jsonArray);
        call.resolve(ret);
    }

    @PluginMethod()
    public void createTrashRequest(PluginCall call) {
        JSArray URI = call.getArray("URIs");
        Collection<Uri> uriCollection = new ArrayList<Uri>();

        for (int i = 0; i < URI.length(); i++) {
            try {
                String value = URI.getString(i);
                Uri myURI = Uri.parse(value);
                uriCollection.add(myURI);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        ContentResolver contentResolver = this.getActivity().getContentResolver();

        PendingIntent intent = MediaStore.createTrashRequest(contentResolver, uriCollection, true);
        try {
            this.getActivity().startIntentSenderForResult(intent.getIntentSender(), 42, null, 0, 0, 0);
        } catch (IntentSender.SendIntentException e) {
            JSObject ret = new JSObject();
            ret.put("value", "denied");
            call.resolve(ret);
        }
    }
}
