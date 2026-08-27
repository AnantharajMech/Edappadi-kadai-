package com.edappadikadai.app

import android.app.Application

class EdappadiApplication : Application() {

    companion object {
        var pendingNotificationPayload: String? = null
    }

    override fun onCreate() {
        super.onCreate()
    }
}

