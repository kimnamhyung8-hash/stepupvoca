package com.stepup.vocaquest;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetPlugin")
public class WidgetPlugin extends Plugin {

    @PluginMethod
    public void requestPinWidget(PluginCall call) {
        Context context = getContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            AppWidgetManager appWidgetManager = context.getSystemService(AppWidgetManager.class);
            ComponentName myProvider = new ComponentName(context, VocaQuestWidget.class);

            if (appWidgetManager.isRequestPinAppWidgetSupported()) {
                Intent pinnedWidgetCallbackIntent = new Intent(context, VocaQuestWidget.class);
                PendingIntent successCallback = PendingIntent.getBroadcast(context, 0,
                        pinnedWidgetCallbackIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

                appWidgetManager.requestPinAppWidget(myProvider, null, successCallback);
                
                JSObject ret = new JSObject();
                ret.put("supported", true);
                call.resolve(ret);
            } else {
                call.reject("Pinning widgets is not supported by this launcher.");
            }
        } else {
            call.reject("Android version too old to support pinning widgets.");
        }
    }

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        int streak = call.getInt("streak", 0);
        int unreadNotifs = call.getInt("unreadNotifs", 0);

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences("WidgetData", Context.MODE_PRIVATE);
        prefs.edit()
                .putInt("streak", streak)
                .putInt("unreadNotifs", unreadNotifs)
                .apply();

        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        ComponentName myProvider = new ComponentName(context, VocaQuestWidget.class);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(myProvider);
        if (appWidgetIds != null && appWidgetIds.length > 0) {
            Intent intent = new Intent(context, VocaQuestWidget.class);
            intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
            context.sendBroadcast(intent);
        }

        call.resolve();
    }
}
