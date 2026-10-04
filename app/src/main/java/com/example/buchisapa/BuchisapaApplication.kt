package com.example.buchisapa

import android.app.Application
import com.example.buchisapa.data.local.AppDatabase
import com.example.buchisapa.data.local.InitialDataSeeder
import com.example.buchisapa.data.repository.BuchisapaRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class BuchisapaApplication : Application() {

    private val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    val database by lazy { AppDatabase.getDatabase(this) }
    val repository by lazy { BuchisapaRepository(database) }

    override fun onCreate() {
        super.onCreate()
        applicationScope.launch {
            InitialDataSeeder.seedDatabase(database)
        }
    }
}
