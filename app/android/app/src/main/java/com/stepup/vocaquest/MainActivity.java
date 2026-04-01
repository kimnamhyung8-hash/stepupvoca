package com.stepup.vocaquest;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
    
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(WidgetPlugin.class);
    }

    @Override
    public void onStart() {
        super.onStart();
        // Force font scale to 100% to ignore system font size settings
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setTextZoom(100);
        }
    }
}
