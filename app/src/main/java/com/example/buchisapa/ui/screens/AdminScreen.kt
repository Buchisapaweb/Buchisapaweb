package com.example.buchisapa.ui.screens

import android.widget.Toast
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.buchisapa.data.model.BusinessConfig
import com.example.buchisapa.data.model.Order
import com.example.buchisapa.data.model.OrderStatus
import com.example.buchisapa.ui.components.ReceiptTicketDialog
import com.example.buchisapa.ui.theme.*
import com.example.buchisapa.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminScreen(
    viewModel: MainViewModel,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    var selectedTab by remember { mutableIntStateOf(0) }
    val orders by viewModel.orders.collectAsStateWithLifecycle()
    val products by viewModel.products.collectAsStateWithLifecycle()
    val claims by viewModel.claims.collectAsStateWithLifecycle()
    val businessConfig by viewModel.businessConfig.collectAsStateWithLifecycle()

    var selectedOrderForTicket by remember { mutableStateOf<Order?>(null) }

    val totalRevenue = orders.sumOf { it.total }
    val pendingOrdersCount = orders.count { it.status == OrderStatus.PENDIENTE.name || it.status == OrderStatus.PREPARANDO.name }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Panel de Administración",
                            fontWeight = FontWeight.Black,
                            color = Color.White
                        )
                        Surface(
                            color = FlameOrange,
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = "ADMIN",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 9.sp,
                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                            )
                        }
                    }
                },
                navigationIcon = {
                    IconButton(
                        onClick = onNavigateBack,
                        modifier = Modifier.testTag("admin_back_button")
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Admin Tabs
            PrimaryTabRow(
                selectedTabIndex = selectedTab,
                containerColor = DarkSurface,
                contentColor = FlameOrange,
                divider = { HorizontalDivider(color = DarkBorder) }
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("Pedidos (${orders.size})", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("Productos (${products.size})", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    text = { Text("Configuración", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
            }

            when (selectedTab) {
                0 -> {
                    // Orders Management Tab
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Quick Stats Row
                        item {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                                    shape = RoundedCornerShape(14.dp),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Column(modifier = Modifier.padding(14.dp)) {
                                        Text(text = "Ventas Totales", color = TextSecondary, fontSize = 11.sp)
                                        Text(
                                            text = "S/ ${String.format("%.2f", totalRevenue)}",
                                            color = FlameOrange,
                                            fontWeight = FontWeight.Black,
                                            fontSize = 18.sp
                                        )
                                    }
                                }

                                Card(
                                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                                    shape = RoundedCornerShape(14.dp),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Column(modifier = Modifier.padding(14.dp)) {
                                        Text(text = "Pendientes en Cocina", color = TextSecondary, fontSize = 11.sp)
                                        Text(
                                            text = "$pendingOrdersCount órdenes",
                                            color = FlameAmber,
                                            fontWeight = FontWeight.Black,
                                            fontSize = 18.sp
                                        )
                                    }
                                }
                            }
                        }

                        items(orders, key = { it.id }) { order ->
                            Card(
                                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                                shape = RoundedCornerShape(16.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("admin_order_${order.orderNumber}")
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp),
                                    verticalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column {
                                            Text(
                                                text = "Comanda #${order.orderNumber}",
                                                color = FlameOrange,
                                                fontWeight = FontWeight.Black,
                                                fontSize = 16.sp
                                            )
                                            Text(
                                                text = "Cliente: ${order.customerName} • Cel: ${order.customerPhone}",
                                                color = Color.White,
                                                fontWeight = FontWeight.SemiBold,
                                                fontSize = 12.sp
                                            )
                                        }

                                        IconButton(
                                            onClick = { selectedOrderForTicket = order },
                                            modifier = Modifier.testTag("admin_print_${order.orderNumber}")
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Print,
                                                contentDescription = "Imprimir Ticket",
                                                tint = FlameAmber
                                            )
                                        }
                                    }

                                    // Items
                                    order.items.forEach { itm ->
                                        Text(
                                            text = "• ${itm.quantity}x ${itm.productName} (S/ ${String.format("%.2f", itm.itemTotal)})",
                                            color = TextSecondary,
                                            fontSize = 12.sp
                                        )
                                        if (itm.instructions.isNotEmpty()) {
                                            Text(
                                                text = "  Nota: ${itm.instructions}",
                                                color = FlameAmber,
                                                fontSize = 11.sp
                                            )
                                        }
                                    }

                                    HorizontalDivider(color = DarkBorder)

                                    // Status Change Actions
                                    Text(
                                        text = "Estado Actual: ${order.status.uppercase()}",
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp
                                    )

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        OrderStatus.values().forEach { st ->
                                            val isCurrent = order.status == st.name
                                            FilledTonalButton(
                                                onClick = { viewModel.updateOrderStatus(order.id, st) },
                                                modifier = Modifier
                                                    .weight(1f)
                                                    .testTag("admin_status_${order.orderNumber}_${st.name.lowercase()}"),
                                                shape = RoundedCornerShape(8.dp),
                                                contentPadding = PaddingValues(horizontal = 2.dp, vertical = 6.dp),
                                                colors = ButtonDefaults.filledTonalButtonColors(
                                                    containerColor = if (isCurrent) FlameOrange else DarkCard,
                                                    contentColor = if (isCurrent) Color.White else TextSecondary
                                                )
                                            ) {
                                                Text(
                                                    text = when (st) {
                                                        OrderStatus.PENDIENTE -> "Pend"
                                                        OrderStatus.PREPARANDO -> "Cocina"
                                                        OrderStatus.LISTO -> "Listo"
                                                        OrderStatus.ENTREGADO -> "Entregado"
                                                        OrderStatus.CANCELADO -> "Cancel"
                                                    },
                                                    fontSize = 10.sp,
                                                    fontWeight = FontWeight.Bold
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                1 -> {
                    // Products Management Tab (Stock & Availability toggles)
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(products, key = { it.id }) { product ->
                            Card(
                                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("admin_product_${product.id}")
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(14.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = product.name,
                                            color = Color.White,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp
                                        )
                                        Text(
                                            text = "Precio: S/ ${String.format("%.2f", product.price)} • Categoría: ${product.categorySlug}",
                                            color = TextSecondary,
                                            fontSize = 12.sp
                                        )
                                    }

                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Text(
                                            text = if (product.available) "Disponible" else "Agotado",
                                            color = if (product.available) AmazonGreen else FlameRed,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 11.sp
                                        )
                                        Switch(
                                            checked = product.available,
                                            onCheckedChange = { isAvailable ->
                                                viewModel.toggleProductAvailability(product.id, isAvailable)
                                            },
                                            colors = SwitchDefaults.colors(
                                                checkedThumbColor = Color.White,
                                                checkedTrackColor = AmazonGreen,
                                                uncheckedTrackColor = DarkCard
                                            ),
                                            modifier = Modifier.testTag("admin_switch_${product.id}")
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
                2 -> {
                    // Store Settings Tab
                    AdminConfigView(
                        config = businessConfig,
                        onSave = { updated ->
                            viewModel.saveBusinessConfig(updated)
                            Toast.makeText(context, "Configuración guardada exitosamente", Toast.LENGTH_SHORT).show()
                        }
                    )
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

@Composable
fun AdminConfigView(
    config: BusinessConfig,
    onSave: (BusinessConfig) -> Unit
) {
    var businessName by remember(config) { mutableStateOf(config.businessName) }
    var ruc by remember(config) { mutableStateOf(config.ruc) }
    var address by remember(config) { mutableStateOf(config.address) }
    var phone by remember(config) { mutableStateOf(config.phone) }
    var email by remember(config) { mutableStateOf(config.email) }
    var deliveryFee by remember(config) { mutableStateOf(config.deliveryFee.toString()) }
    var printerIp by remember(config) { mutableStateOf(config.printerIp) }
    var openingHours by remember(config) { mutableStateOf(config.openingHours) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Datos de la Empresa y Local",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )

                    OutlinedTextField(
                        value = businessName,
                        onValueChange = { businessName = it },
                        label = { Text("Nombre Comercial") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = FlameOrange,
                            unfocusedBorderColor = DarkBorder,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )

                    OutlinedTextField(
                        value = ruc,
                        onValueChange = { ruc = it },
                        label = { Text("RUC") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = FlameOrange,
                            unfocusedBorderColor = DarkBorder,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )

                    OutlinedTextField(
                        value = address,
                        onValueChange = { address = it },
                        label = { Text("Dirección del Local") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = FlameOrange,
                            unfocusedBorderColor = DarkBorder,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )

                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Teléfono / WhatsApp") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = FlameOrange,
                            unfocusedBorderColor = DarkBorder,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )

                    OutlinedTextField(
                        value = deliveryFee,
                        onValueChange = { deliveryFee = it },
                        label = { Text("Costo de Delivery S/") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = FlameOrange,
                            unfocusedBorderColor = DarkBorder,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )

                    OutlinedTextField(
                        value = printerIp,
                        onValueChange = { printerIp = it },
                        label = { Text("IP Impresora Térmica WiFi") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = FlameOrange,
                            unfocusedBorderColor = DarkBorder,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )

                    OutlinedTextField(
                        value = openingHours,
                        onValueChange = { openingHours = it },
                        label = { Text("Horario de Atención") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = FlameOrange,
                            unfocusedBorderColor = DarkBorder,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )

                    Button(
                        onClick = {
                            onSave(
                                config.copy(
                                    businessName = businessName,
                                    ruc = ruc,
                                    address = address,
                                    phone = phone,
                                    email = email,
                                    deliveryFee = deliveryFee.toDoubleOrNull() ?: config.deliveryFee,
                                    printerIp = printerIp,
                                    openingHours = openingHours
                                )
                            )
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("admin_save_config_button"),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = FlameOrange)
                    ) {
                        Text(text = "Guardar Configuración", fontWeight = FontWeight.Bold, color = Color.White)
                    }
                }
            }
        }
    }
}
