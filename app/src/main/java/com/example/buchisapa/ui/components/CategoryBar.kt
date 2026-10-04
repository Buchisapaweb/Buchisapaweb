package com.example.buchisapa.ui.components

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.buchisapa.data.model.Category
import com.example.buchisapa.ui.theme.*

@Composable
fun CategoryBar(
    categories: List<Category>,
    selectedSlug: String,
    onSelectCategory: (String) -> Unit
) {
    val scrollState = rememberScrollState()

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(scrollState)
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // "Todos" pill
        val isAllSelected = selectedSlug == "all"
        FilterChip(
            selected = isAllSelected,
            onClick = { onSelectCategory("all") },
            label = {
                Text(
                    text = "TODO EL MENÚ",
                    fontWeight = if (isAllSelected) FontWeight.ExtraBold else FontWeight.Medium,
                    fontSize = 12.sp
                )
            },
            shape = RoundedCornerShape(20.dp),
            colors = FilterChipDefaults.filterChipColors(
                selectedContainerColor = FlameOrange,
                selectedLabelColor = Color.White,
                containerColor = DarkCard,
                labelColor = TextSecondary
            ),
            border = FilterChipDefaults.filterChipBorder(
                borderColor = if (isAllSelected) FlameOrange else DarkBorder,
                selectedBorderColor = FlameOrange,
                enabled = true,
                selected = isAllSelected
            ),
            modifier = Modifier.testTag("category_chip_all")
        )

        categories.forEach { category ->
            val isSelected = selectedSlug.equals(category.slug, ignoreCase = true)
            FilterChip(
                selected = isSelected,
                onClick = { onSelectCategory(category.slug) },
                label = {
                    Text(
                        text = category.name,
                        fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.Medium,
                        fontSize = 12.sp
                    )
                },
                shape = RoundedCornerShape(20.dp),
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = FlameOrange,
                    selectedLabelColor = Color.White,
                    containerColor = DarkCard,
                    labelColor = TextSecondary
                ),
                border = FilterChipDefaults.filterChipBorder(
                    borderColor = if (isSelected) FlameOrange else DarkBorder,
                    selectedBorderColor = FlameOrange,
                    enabled = true,
                    selected = isSelected
                ),
                modifier = Modifier.testTag("category_chip_${category.slug}")
            )
        }
    }
}
