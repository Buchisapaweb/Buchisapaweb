package com.example.buchisapa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.buchisapa.data.model.Order
import com.example.buchisapa.data.model.OrderStatus
import com.example.buchisapa.ui.components.ReceiptTicketDialog
import com.example.buchisapa.ui.theme.*
import com.example.buchisapa.ui.viewmodel.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersTrackerScreen(
    viewModel: MainViewModel,
    onNavigateBack: () -> Unit
) {
    val orders by viewModel.orders.collectAsStateWithLifecycle()
    var selectedOrderForTicket by remember { mutableStateOf<Order?>(null) }
    val dateFormat = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Seguimiento de Pedidos",
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                },
                navigationIcon = {
                    IconButton(
                        onClick = onNavigateBack,
                        modifier = Modifier.testTag("tracker_back_button")
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Volver",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DarkSurface)
            )
        },
        containerColor = DarkBg
    ) { paddingValues ->
        if (orders.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.padding(32.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ReceiptLong,
                        contentDescription = "Sin pedidos",
                        tint = TextMuted,
                        modifier = Modifier.size(56.dp)
                    )
                    Text(
                        text = "Aún no tienes pedidos registrados",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Realiza tu primer pedido de hamburguesas o broasters para ver su estado en tiempo real.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(orders, key = { it.id }) { order ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = DarkSurface),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("order_item_${order.orderNumber}")
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // Top Row: Code, Time, Status badge
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = "#${order.orderNumber}",
                                        fontWeight = FontWeight.Black,
                                        fontSize = 16.sp,
                                        color = FlameOrange
                                    )
                                    Text(
                                        text = dateFormat.format(Date(order.createdAt)),
                                        fontSize = 11.sp,
                                        color = TextSecondary
                                    )
                                }

                                val statusColor = when (order.status) {
                                    OrderStatus.PENDIENTE.name -> StatusPending
                                    OrderStatus.PREPARANDO.name -> StatusCooking
                                    OrderStatus.LISTO.name -> AmazonGreen
                                    OrderStatus.ENTREGADO.name -> StatusReady
                                    else -> StatusCancelled
                                }

                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = statusColor.copy(alpha = 0.15f)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(6.dp)
                                                .clip(CircleShape)
                                                .background(statusColor)
                                        )
                                        Text(
                                            text = when (order.status) {
                                                OrderStatus.PENDIENTE.name -> "Pendiente"
                                                OrderStatus.PREPARANDO.name -> "En Cocina"
                                                OrderStatus.LISTO.name -> "Listo / En Camino"
                                                OrderStatus.ENTREGADO.name -> "Entregado"
                                                else -> "Cancelado"
                                            },
                                            color = statusColor,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 11.sp
                                        )
                                    }
                                }
                            }

                            // Stepper indicator
                            val currentStep = when (order.status) {
                                OrderStatus.PENDIENTE.name -> 1
                                OrderStatus.PREPARANDO.name -> 2
                                OrderStatus.LISTO.name -> 3
                                OrderStatus.ENTREGADO.name -> 4
                                else -> 0
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                listOf("Recibido", "Cocina", "En Camino", "Entregado").forEachIndexed { index, stepName ->
                                    val stepNum = index + 1
                                    val isCompleted = currentStep >= stepNum

                                    Column(
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(20.dp)
                                                .clip(CircleShape)
                                                .background(if (isCompleted) FlameOrange else DarkBorder),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            if (isCompleted) {
                                                Icon(
                                                    imageVector = Icons.Default.Check,
                                                    contentDescription = "Completado",
                                                    tint = Color.White,
                                                    modifier = Modifier.size(12.dp)
                                                )
                                            } else {
                                                Text(
                                                    text = "$stepNum",
                                                    color = TextMuted,
                                                    fontSize = 10.sp,
                                                    fontWeight = FontWeight.Bold
                                                )
                                            }
                                        }
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(
                                            text = stepName,
                                            fontSize = 9.sp,
                                            color = if (isCompleted) Color.White else TextMuted,
                                            fontWeight = if (isCompleted) FontWeight.Bold else FontWeight.Normal
                                        )
                                    }
                                }
                            }

                            HorizontalDivider(color = DarkBorder)

                            // Items summary
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                order.items.forEach { item ->
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(
                                            text = "${item.quantity}x ${item.productName}",
                                            color = Color.White,
                                            fontSize = 12.sp,
                                            modifier = Modifier.weight(1f)
                                        )
                                        Text(
                                            text = "S/ ${String.format("%.2f", item.itemTotal)}",
                                            color = TextSecondary,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    }
                                }
                            }

                            // Total & Ticket Button
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = "Total Pagado: S/ ${String.format("%.2f", order.total)}",
                                        color = FlameOrange,
                                        fontWeight = FontWeight.Black,
                                        fontSize = 14.sp
                                    )
                                    Text(
                                        text = "Entrega: ${order.orderType}",
                                        color = TextSecondary,
                                        fontSize = 11.sp
                                    )
                                }

                                FilledTonalButton(
                                    onClick = { selectedOrderForTicket = order },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.filledTonalButtonColors(
                                        containerColor = DarkCard,
                                        contentColor = FlameAmber
                                    ),
                                    modifier = Modifier.testTag("tracker_ticket_btn_${order.orderNumber}")
                                ) {
                                    Icon(Icons.Default.Receipt, contentDescription = "Ticket", modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(text = "Comanda", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }

        selectedOrderForTicket?.let { order ->
            ReceiptTicketDialog(
                order = order,
                onDismiss = { selectedOrderForTicket = null }
            )
        }
    }
}
