package com.stepup.vocaquest;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

public class VocaQuestWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.vocaquest_widget);

        SharedPreferences prefs = context.getSharedPreferences("WidgetData", Context.MODE_PRIVATE);
        int streak = prefs.getInt("streak", 0);
        int unreadNotifs = prefs.getInt("unreadNotifs", 0);

        views.setTextViewText(R.id.widget_streak, "🔥 " + streak + "일");
        if (unreadNotifs > 0) {
            views.setTextViewText(R.id.widget_msg, "💬 알림 " + unreadNotifs + "개!");
        } else {
            views.setTextViewText(R.id.widget_msg, "공부하러 갈 시간이에요!");
        }

        // Click intent to open the app
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.logo_area, pendingIntent);
        views.setOnClickPendingIntent(R.id.widget_msg, pendingIntent);
        views.setOnClickPendingIntent(R.id.widget_streak, pendingIntent);

        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
