package com.example.buchisapa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.DeliveryDining
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.buchisapa.ui.components.ReceiptTicketDialog
import com.example.buchisapa.ui.theme.*
import com.example.buchisapa.ui.viewmodel.MainViewModel

@Composable
fun OrderSuccessScreen(
    orderId: String,
    viewModel: MainViewModel,
    onNavigateToHome: () -> Unit,
    onNavigateToTracker: () -> Unit
) {
    val orders by viewModel.orders.collectAsStateWithLifecycle()
    val order = orders.find { it.id == orderId } ?: viewModel.lastCreatedOrder.value
    var showTicketDialog by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = DarkBg
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            item {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(CircleShape)
                        .background(AmazonGreen),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = "Éxito",
                        tint = Color.White,
                        modifier = Modifier.size(48.dp)
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    text = "¡Pedido Registrado con Éxito!",
                    style = MaterialTheme.typography.headlineMedium,
                    color = Color.White,
                    fontWeight = FontWeight.Black,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "La cocina de BuchiSapa ya está preparando tus platos con todo el sazón amazónico.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(24.dp))

                order?.let { ord ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = DarkSurface),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(text = "Código de Orden:", color = TextSecondary, fontSize = 13.sp)
                                Text(
                                    text = "#${ord.orderNumber}",
                                    color = FlameOrange,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 15.sp
                                )
                            }
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(text = "Cliente:", color = TextSecondary, fontSize = 13.sp)
                                Text(text = ord.customerName, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            }
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(text = "Tipo de Entrega:", color = TextSecondary, fontSize = 13.sp)
                                Text(text = ord.orderType, color = FlameAmber, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            }
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(text = "Total a Pagar:", color = TextSecondary, fontSize = 13.sp)
                                Text(
                                    text = "S/ ${String.format("%.2f", ord.total)}",
                                    color = FlameOrange,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 16.sp
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Action buttons
                    Button(
                        onClick = { showTicketDialog = true },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("view_ticket_button"),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = DarkCard)
                    ) {
                        Icon(imageVector = Icons.Default.Receipt, contentDescription = "Ticket", tint = FlameAmber)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = "Ver Ticket / Comanda Digital", color = Color.White, fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Button(
                        onClick = onNavigateToTracker,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("track_order_button"),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = FlameOrange)
                    ) {
                        Icon(imageVector = Icons.Default.DeliveryDining, contentDescription = "Seguimiento", tint = Color.White)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = "Seguir Estado del Pedido", color = Color.White, fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedButton(
                        onClick = onNavigateToHome,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("back_to_menu_button"),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = TextSecondary)
                    ) {
                        Icon(imageVector = Icons.Default.Home, contentDescription = "Inicio")
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = "Volver a la Carta Principal")
                    }
                }
            }
        }

        if (showTicketDialog && order != null) {
            ReceiptTicketDialog(
                order = order,
                onDismiss = { showTicketDialog = false }
            )
        }
    }
}
