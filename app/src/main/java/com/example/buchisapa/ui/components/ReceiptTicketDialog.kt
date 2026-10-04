package com.example.buchisapa.ui.components

import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Print
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.buchisapa.data.model.Order
import com.example.buchisapa.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun ReceiptTicketDialog(
    order: Order,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()
    val dateFormat = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())
    val formattedDate = dateFormat.format(Date(order.createdAt))

    val ticketPlainText = buildString {
        appendLine("================================")
        appendLine("       BUCHISAPA BURGER         ")
        appendLine("   Pollería & Sabor Amazónico   ")
        appendLine("  Av. La Estrella con 28 Julio  ")
        appendLine("       Santa Clara - Ate        ")
        appendLine("    RUC: 10723456781 - PERÚ     ")
        appendLine("================================")
        appendLine("ORDEN: #${order.orderNumber}")
        appendLine("FECHA: $formattedDate")
        appendLine("TIPO: ${order.orderType}")
        appendLine("CLIENTE: ${order.customerName}")
        appendLine("TELÉFONO: ${order.customerPhone}")
        if (order.deliveryAddress.isNotEmpty()) {
            appendLine("DIRECCIÓN: ${order.deliveryAddress}")
        }
        if (order.tableNumber.isNotEmpty()) {
            appendLine("MESA: ${order.tableNumber}")
        }
        appendLine("--------------------------------")
        appendLine("CANT  DESCRIPCIÓN        TOTAL  ")
        appendLine("--------------------------------")
        order.items.forEach { item ->
            appendLine("${item.quantity}x ${item.productName.take(18).padEnd(18)} S/${String.format("%.2f", item.itemTotal)}")
            if (item.selectedCremas.isNotEmpty()) {
                appendLine("   Cremas: ${item.selectedCremas.joinToString(", ")}")
            }
            if (item.selectedExtras.isNotEmpty()) {
                appendLine("   Extras: ${item.selectedExtras.joinToString { it.name }}")
            }
            if (item.instructions.isNotEmpty()) {
                appendLine("   Nota: ${item.instructions}")
            }
        }
        appendLine("--------------------------------")
        appendLine("SUBTOTAL:          S/ ${String.format("%.2f", order.subtotal)}")
        if (order.deliveryFee > 0) {
            appendLine("DELIVERY:          S/ ${String.format("%.2f", order.deliveryFee)}")
        }
        appendLine("TOTAL:             S/ ${String.format("%.2f", order.total)}")
        appendLine("PAGO:              ${order.paymentMethod}")
        appendLine("================================")
        appendLine(" ¡GRACIAS POR SU PREFERENCIA!   ")
        appendLine("      www.buchisapa.pe          ")
        appendLine("================================")
    }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
                .testTag("receipt_ticket_dialog"),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = DarkSurface)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                // Header with close button
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Ticket Digital / Comanda",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Cerrar", tint = TextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Receipt Paper Container (Thermal Printer Aesthetic)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f, fill = false)
                        .heightIn(max = 380.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFFFFFBEB))
                        .border(1.dp, Color(0xFFFDE68A), RoundedCornerShape(8.dp))
                        .padding(12.dp)
                        .verticalScroll(scrollState)
                ) {
                    Text(
                        text = ticketPlainText,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        color = Color(0xFF1E293B),
                        lineHeight = 16.sp
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Action Buttons: Print WiFi simulation & Share
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = {
                            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_SUBJECT, "Comanda BuchiSapa #${order.orderNumber}")
                                putExtra(Intent.EXTRA_TEXT, ticketPlainText)
                            }
                            context.startActivity(Intent.createChooser(shareIntent, "Compartir Comanda"))
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = FlameOrange)
                    ) {
                        Icon(Icons.Default.Share, contentDescription = "Compartir", modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Compartir", fontSize = 12.sp)
                    }

                    Button(
                        onClick = {
                            Toast.makeText(context, "🖨️ Enviado a Impresora Térmica (192.168.8.100:80)", Toast.LENGTH_LONG).show()
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = FlameOrange)
                    ) {
                        Icon(Icons.Default.Print, contentDescription = "Imprimir", modifier = Modifier.size(16.dp), tint = Color.White)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Imprimir WiFi", fontSize = 12.sp, color = Color.White)
                    }
                }
            }
        }
    }
}
