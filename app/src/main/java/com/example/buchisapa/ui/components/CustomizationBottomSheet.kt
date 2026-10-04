package com.example.buchisapa.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.buchisapa.data.model.ExtraOption
import com.example.buchisapa.data.model.Product
import com.example.buchisapa.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomizationBottomSheet(
    product: Product,
    onDismiss: () -> Unit,
    onAddToCart: (
        product: Product,
        quantity: Int,
        accompaniments: List<String>,
        cremas: List<String>,
        extras: List<ExtraOption>,
        instructions: String
    ) -> Unit
) {
    var quantity by remember { mutableIntStateOf(1) }
    var instructions by remember { mutableStateOf("") }

    val selectedAccompaniments = remember {
        mutableStateListOf<String>().apply { addAll(product.accompaniments) }
    }

    val selectedCremas = remember {
        mutableStateListOf<String>().apply { addAll(product.cremas) }
    }

    val availableExtras = remember {
        mutableStateListOf(
            ExtraOption("ext-1", "Huevo Frito a la Plancha", 2.0, false),
            ExtraOption("ext-2", "Lámina de Queso Fundido", 2.0, false),
            ExtraOption("ext-3", "Tiras de Tocino Ahumado", 2.0, false),
            ExtraOption("ext-4", "Plátano Maduro Frito", 2.0, false),
            ExtraOption("ext-5", "Porción Extra de Papas Crocantes", 4.0, false)
        )
    }

    val extrasTotal = availableExtras.filter { it.selected }.sumOf { it.price }
    val unitPrice = product.price + extrasTotal
    val grandTotal = unitPrice * quantity

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = DarkSurface,
        dragHandle = { BottomSheetDefaults.DragHandle(color = TextMuted) },
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 24.dp)
        ) {
            // Header: Product photo, Title, Price
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(product.image)
                        .crossfade(true)
                        .build(),
                    contentDescription = product.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(72.dp)
                        .clip(RoundedCornerShape(12.dp))
                )

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = product.name,
                        style = MaterialTheme.typography.titleLarge,
                        color = Color.White,
                        fontWeight = FontWeight.Black
                    )
                    Text(
                        text = "Precio base: S/ ${String.format("%.2f", product.price)}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = FlameOrange,
                        fontWeight = FontWeight.Bold
                    )
                }

                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier.testTag("close_sheet_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Cerrar",
                        tint = TextSecondary
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
            HorizontalDivider(color = DarkBorder)
            Spacer(modifier = Modifier.height(16.dp))

            // Scrollable Customization Options
            LazyColumn(
                modifier = Modifier
                    .weight(1f, fill = false)
                    .heightIn(max = 400.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Accompaniments section
                if (product.accompaniments.isNotEmpty()) {
                    item {
                        Text(
                            text = "Guarniciones Incluidas",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Selecciona tus guarniciones favoritas",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        product.accompaniments.forEach { acc ->
                            val isChecked = selectedAccompaniments.contains(acc)
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(8.dp))
                                    .clickable {
                                        if (isChecked) selectedAccompaniments.remove(acc)
                                        else selectedAccompaniments.add(acc)
                                    }
                                    .padding(vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = acc,
                                    color = if (isChecked) Color.White else TextSecondary,
                                    fontSize = 13.sp
                                )
                                Checkbox(
                                    checked = isChecked,
                                    onCheckedChange = { checked ->
                                        if (checked) selectedAccompaniments.add(acc)
                                        else selectedAccompaniments.remove(acc)
                                    },
                                    colors = CheckboxDefaults.colors(
                                        checkedColor = FlameOrange,
                                        uncheckedColor = TextMuted
                                    )
                                )
                            }
                        }
                    }
                }

                // Cremas / Salsas section
                if (product.cremas.isNotEmpty()) {
                    item {
                        Text(
                            text = "Cremas & Salsas Caseras",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Ají de rocoto, tártara, mayonesa...",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        product.cremas.forEach { crema ->
                            val isChecked = selectedCremas.contains(crema)
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(8.dp))
                                    .clickable {
                                        if (isChecked) selectedCremas.remove(crema)
                                        else selectedCremas.add(crema)
                                    }
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = crema,
                                    color = if (isChecked) Color.White else TextSecondary,
                                    fontSize = 13.sp
                                )
                                Checkbox(
                                    checked = isChecked,
                                    onCheckedChange = { checked ->
                                        if (checked) selectedCremas.add(crema)
                                        else selectedCremas.remove(crema)
                                    },
                                    colors = CheckboxDefaults.colors(
                                        checkedColor = FlameAmber,
                                        uncheckedColor = TextMuted
                                    )
                                )
                            }
                        }
                    }
                }

                // Additional Extras
                item {
                    Text(
                        text = "Adicionales / Extras",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    availableExtras.forEachIndexed { index, extra ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .clickable {
                                    availableExtras[index] = extra.copy(selected = !extra.selected)
                                }
                                .padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = extra.name,
                                    color = if (extra.selected) Color.White else TextSecondary,
                                    fontSize = 13.sp
                                )
                                Text(
                                    text = "+ S/ ${String.format("%.2f", extra.price)}",
                                    color = FlameAmber,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Checkbox(
                                checked = extra.selected,
                                onCheckedChange = { checked ->
                                    availableExtras[index] = extra.copy(selected = checked)
                                },
                                colors = CheckboxDefaults.colors(
                                    checkedColor = FlameOrange,
                                    uncheckedColor = TextMuted
                                )
                            )
                        }
                    }
                }

                // Special notes
                item {
                    Text(
                        text = "Instrucciones Especiales",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = instructions,
                        onValueChange = { instructions = it },
                        placeholder = { Text("Ej: papas bien doradas, sin mayonesa...", color = TextMuted, fontSize = 12.sp) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("custom_instructions_input"),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = FlameOrange,
                            unfocusedBorderColor = DarkBorder,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
            HorizontalDivider(color = DarkBorder)
            Spacer(modifier = Modifier.height(16.dp))

            // Bottom controls: Quantity & Add Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Quantity Counter
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier
                        .background(DarkCard, RoundedCornerShape(12.dp))
                        .padding(4.dp)
                ) {
                    IconButton(
                        onClick = { if (quantity > 1) quantity-- },
                        modifier = Modifier
                            .size(32.dp)
                            .testTag("decrement_qty_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Remove,
                            contentDescription = "Menos",
                            tint = Color.White,
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    Text(
                        text = "$quantity",
                        color = Color.White,
                        fontWeight = FontWeight.Black,
                        fontSize = 16.sp,
                        modifier = Modifier.padding(horizontal = 8.dp)
                    )

                    IconButton(
                        onClick = { quantity++ },
                        modifier = Modifier
                            .size(32.dp)
                            .testTag("increment_qty_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Más",
                            tint = FlameOrange,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }

                // Add Button with Grand Total
                Button(
                    onClick = {
                        onAddToCart(
                            product,
                            quantity,
                            selectedAccompaniments.toList(),
                            selectedCremas.toList(),
                            availableExtras.toList(),
                            instructions
                        )
                    },
                    modifier = Modifier
                        .weight(1f)
                        .padding(start = 16.dp)
                        .height(48.dp)
                        .testTag("confirm_add_to_cart_button"),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = FlameOrange
                    )
                ) {
                    Text(
                        text = "Agregar • S/ ${String.format("%.2f", grandTotal)}",
                        color = Color.White,
                        fontWeight = FontWeight.Black,
                        fontSize = 14.sp
                    )
                }
            }
        }
    }
}
