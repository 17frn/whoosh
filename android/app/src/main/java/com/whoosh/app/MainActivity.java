package com.whoosh.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WhooshBridgeWebViewClient;

public class MainActivity extends BridgeActivity {

    @Override
    protected void load() {
        super.load();
        if (bridge != null) {
            bridge.setWebViewClient(new WhooshBridgeWebViewClient(bridge));
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (bridge != null) {
            bridge.setWebViewClient(new WhooshBridgeWebViewClient(bridge));
        }
    }
}
