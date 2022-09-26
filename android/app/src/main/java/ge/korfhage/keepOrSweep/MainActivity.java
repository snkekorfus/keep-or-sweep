package ge.korfhage.keepOrSweep;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.keeporsweep.starter.AndroidMediaStore.AndroidMediaStorePlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AndroidMediaStorePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
