package com.example.buchisapa.data.local

import androidx.room.TypeConverter
import com.example.buchisapa.data.model.CartItem
import com.example.buchisapa.data.model.ExtraOption
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class Converters {
    private val json = Json { ignoreUnknownKeys = true; isLenient = true }

    @TypeConverter
    fun fromStringList(value: List<String>?): String {
        return json.encodeToString(value ?: emptyList())
    }

    @TypeConverter
    fun toStringList(value: String?): List<String> {
        if (value.isNullOrEmpty()) return emptyList()
        return try {
            json.decodeFromString(value)
        } catch (e: Exception) {
            emptyList()
        }
    }

    @TypeConverter
    fun fromCartItemList(value: List<CartItem>?): String {
        return json.encodeToString(value ?: emptyList())
    }

    @TypeConverter
    fun toCartItemList(value: String?): List<CartItem> {
        if (value.isNullOrEmpty()) return emptyList()
        return try {
            json.decodeFromString(value)
        } catch (e: Exception) {
            emptyList()
        }
    }

    @TypeConverter
    fun fromExtraOptionList(value: List<ExtraOption>?): String {
        return json.encodeToString(value ?: emptyList())
    }

    @TypeConverter
    fun toExtraOptionList(value: String?): List<ExtraOption> {
        if (value.isNullOrEmpty()) return emptyList()
        return try {
            json.decodeFromString(value)
        } catch (e: Exception) {
            emptyList()
        }
    }
}
