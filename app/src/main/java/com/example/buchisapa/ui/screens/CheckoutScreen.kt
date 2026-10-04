package com.example.buchisapa.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.buchisapa.data.model.Order
import com.example.buchisapa.data.model.OrderType
import com.example.buchisapa.data.model.PaymentMethod
import com.example.buchisapa.ui.theme.*
import com.example.buchisapa.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(
    viewModel: MainViewModel,
    onNavigateBack: () -> Unit,
    onOrderPlaced: (Order) -> Unit
) {
    val context = LocalContext.current
    val cartItems by viewModel.cartItems.collectAsStateWithLifecycle()
    val cartSubtotal by viewModel.cartSubtotal.collectAsStateWithLifecycle()
    val businessConfig by viewModel.businessConfig.collectAsStateWithLifecycle()

    var customerName by remember { mutableStateOf("") }
    var customerPhone by remember { mutableStateOf("") }
    var customerEmail by remember { mutableStateOf("") }

    var selectedOrderType by remember { mutableStateOf(OrderType.DELIVERY) }
    var deliveryAddress by remember { mutableStateOf("") }
    var deliveryReference by remember { mutableStateOf("") }
    var tableNumber by remember { mutableStateOf("") }

    var selectedPaymentMethod by remember { mutableStateOf(PaymentMethod.EFECTIVO) }
    var cashPayerAmount by remember { mutableStateOf("") }
    var orderNotes by remember { mutableStateOf("") }

    var isSubmitting by remember { mutableStateOf(false) }

    val deliveryFee = if (selectedOrderType == OrderType.DELIVERY) businessConfig.deliveryFee else 0.0
    val total = cartSubtotal + deliveryFee

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Finalizar Pedido",
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                },
                navigationIcon = {
                    IconButton(
                        onClick = onNavigateBack,
                        modifier = Modifier.testTag("checkout_back_button")
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
        bottomBar = {
            Surface(
                color = DarkSurface,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Total a Pagar:",
                            color = Color.White,
                            fontWeight = FontWeight.Black,
                            fontSize = 16.sp
                        )
                        Text(
                            text = "S/ ${String.format("%.2f", total)}",
                            color = FlameOrange,
                            fontWeight = FontWeight.Black,
                            fontSize = 22.sp
                        )
                    }

                    Button(
                        onClick = {
                            if (customerName.isBlank()) {
                                Toast.makeText(context, "Por favor ingrese su nombre", Toast.LENGTH_SHORT).show()
                                return@Button
                            }
                            if (customerPhone.isBlank() || customerPhone.length < 9) {
                                Toast.makeText(context, "Ingrese un número celular válido (9 dígitos)", Toast.LENGTH_SHORT).show()
                                return@Button
                            }
                            if (selectedOrderType == OrderType.DELIVERY && deliveryAddress.isBlank()) {
                                Toast.makeText(context, "Por favor ingrese su dirección de entrega", Toast.LENGTH_SHORT).show()
                                return@Button
                            }
                            if (selectedOrderType == OrderType.DINE_IN && tableNumber.isBlank()) {
                                Toast.makeText(context, "Por favor ingrese el número de mesa", Toast.LENGTH_SHORT).show()
                                return@Button
                            }

                            isSubmitting = true
                            viewModel.placeOrder(
                                customerName = customerName.trim(),
                                customerPhone = customerPhone.trim(),
                                customerEmail = customerEmail.trim(),
                                orderType = selectedOrderType,
                                deliveryAddress = deliveryAddress.trim(),
                                deliveryReference = deliveryReference.trim(),
                                tableNumber = tableNumber.trim(),
                                paymentMethod = selectedPaymentMethod,
                                paymentAmountCash = cashPayerAmount.toDoubleOrNull() ?: total,
                                notes = orderNotes.trim(),
                                deliveryFee = deliveryFee,
                                onSuccess = { order ->
                                    isSubmitting = false
                                    onOrderPlaced(order)
                                }
                            )
                        },
                        enabled = !isSubmitting && cartItems.isNotEmpty(),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .testTag("confirm_order_button"),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = FlameOrange)
                    ) {
                        if (isSubmitting) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                        } else {
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = "Confirmar",
                                    tint = Color.White
                                )
                                Text(
                                    text = "Confirmar y Enviar Pedido",
                                    color = Color.White,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 15.sp
                                )
                            }
                        }
                    }
                }
            }
        },
        containerColor = DarkBg
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Customer Info Section
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
                            text = "1. Datos del Cliente",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )

                        OutlinedTextField(
                            value = customerName,
                            onValueChange = { customerName = it },
                            label = { Text("Nombre y Apellidos *") },
                            placeholder = { Text("Ej: Juan Pérez") },
                            singleLine = true,
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("checkout_name_input"),
                            shape = RoundedCornerShape(10.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = FlameOrange,
                                unfocusedBorderColor = DarkBorder,
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedLabelColor = FlameOrange,
                                unfocusedLabelColor = TextSecondary
                            )
                        )

                        OutlinedTextField(
                            value = customerPhone,
                            onValueChange = { if (it.length <= 9) customerPhone = it },
                            label = { Text("Celular / WhatsApp *") },
                            placeholder = { Text("987654321") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            singleLine = true,
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("checkout_phone_input"),
                            shape = RoundedCornerShape(10.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = FlameOrange,
                                unfocusedBorderColor = DarkBorder,
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedLabelColor = FlameOrange,
                                unfocusedLabelColor = TextSecondary
                            )
                        )

                        OutlinedTextField(
                            value = customerEmail,
                            onValueChange = { customerEmail = it },
                            label = { Text("Correo Electrónico (Opcional)") },
                            placeholder = { Text("cliente@gmail.com") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                            singleLine = true,
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("checkout_email_input"),
                            shape = RoundedCornerShape(10.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = FlameOrange,
                                unfocusedBorderColor = DarkBorder,
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedLabelColor = FlameOrange,
                                unfocusedLabelColor = TextSecondary
                            )
                        )
                    }
                }
            }

            // Order Modality & Location Section
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
                            text = "2. Tipo de Entrega",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OrderType.values().forEach { type ->
                                val isSelected = selectedOrderType == type
                                Surface(
                                    onClick = { selectedOrderType = type },
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .testTag("checkout_order_type_${type.name.lowercase()}"),
                                    color = if (isSelected) FlameOrange else DarkCard,
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Box(
                                        modifier = Modifier.padding(vertical = 10.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = type.displayName.split(" ").first(),
                                            color = if (isSelected) Color.White else TextSecondary,
                                            fontWeight = if (isSelected) FontWeight.Black else FontWeight.Medium,
                                            fontSize = 12.sp
                                        )
                                    }
                                }
                            }
                        }

                        when (selectedOrderType) {
                            OrderType.DELIVERY -> {
                                OutlinedTextField(
                                    value = deliveryAddress,
                                    onValueChange = { deliveryAddress = it },
                                    label = { Text("Dirección Exacta de Entrega *") },
                                    placeholder = { Text("Av. La Estrella 450, Urb. Santa Clara") },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .testTag("checkout_address_input"),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = FlameOrange,
                                        unfocusedBorderColor = DarkBorder,
                                        focusedTextColor = Color.White,
                                        unfocusedTextColor = Color.White,
                                        focusedLabelColor = FlameOrange,
                                        unfocusedLabelColor = TextSecondary
                                    )
                                )

                                OutlinedTextField(
                                    value = deliveryReference,
                                    onValueChange = { deliveryReference = it },
                                    label = { Text("Referencia de Entrega") },
                                    placeholder = { Text("Frente al parque, casa portón verde") },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .testTag("checkout_reference_input"),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = FlameOrange,
                                        unfocusedBorderColor = DarkBorder,
                                        focusedTextColor = Color.White,
                                        unfocusedTextColor = Color.White,
                                        focusedLabelColor = FlameOrange,
                                        unfocusedLabelColor = TextSecondary
                                    )
                                )
                            }
                            OrderType.PICKUP -> {
                                Surface(
                                    color = DarkCard,
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(
                                        modifier = Modifier.padding(12.dp),
                                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Store,
                                            contentDescription = "Local",
                                            tint = FlameOrange
                                        )
                                        Column {
                                            Text(
                                                text = "Recojo en Tienda BuchiSapa",
                                                color = Color.White,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 13.sp
                                            )
                                            Text(
                                                text = businessConfig.address,
                                                color = TextSecondary,
                                                fontSize = 11.sp
                                            )
                                        }
                                    }
                                }
                            }
                            OrderType.DINE_IN -> {
                                OutlinedTextField(
                                    value = tableNumber,
                                    onValueChange = { tableNumber = it },
                                    label = { Text("Número de Mesa en Local *") },
                                    placeholder = { Text("Ej: Mesa 4") },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .testTag("checkout_table_input"),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = FlameOrange,
                                        unfocusedBorderColor = DarkBorder,
                                        focusedTextColor = Color.White,
                                        unfocusedTextColor = Color.White,
                                        focusedLabelColor = FlameOrange,
                                        unfocusedLabelColor = TextSecondary
                                    )
                                )
                            }
                        }
                    }
                }
            }

            // Payment Method Section
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
                            text = "3. Método de Pago",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )

                        PaymentMethod.values().forEach { method ->
                            val isSelected = selectedPaymentMethod == method
                            Surface(
                                onClick = { selectedPaymentMethod = method },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .testTag("payment_method_${method.name.lowercase()}"),
                                color = if (isSelected) DarkBorder else DarkCard,
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                                    ) {
                                        Icon(
                                            imageVector = when (method) {
                                                PaymentMethod.EFECTIVO -> Icons.Default.Payments
                                                PaymentMethod.YAPE_PLIN -> Icons.Default.QrCodeScanner
                                                PaymentMethod.TARJETA -> Icons.Default.CreditCard
                                            },
                                            contentDescription = method.displayName,
                                            tint = if (isSelected) FlameOrange else TextSecondary
                                        )
                                        Column {
                                            Text(
                                                text = method.displayName,
                                                color = if (isSelected) Color.White else TextSecondary,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 13.sp
                                            )
                                            Text(
                                                text = when (method) {
                                                    PaymentMethod.EFECTIVO -> "Paga al recibir (con billete o cambio)"
                                                    PaymentMethod.YAPE_PLIN -> "Billetera digital (942 475 459)"
                                                    PaymentMethod.TARJETA -> "Visa, Mastercard, Débito / Crédito"
                                                },
                                                color = TextMuted,
                                                fontSize = 11.sp
                                            )
                                        }
                                    }

                                    RadioButton(
                                        selected = isSelected,
                                        onClick = { selectedPaymentMethod = method },
                                        colors = RadioButtonDefaults.colors(selectedColor = FlameOrange)
                                    )
                                }
                            }
                        }

                        if (selectedPaymentMethod == PaymentMethod.EFECTIVO) {
                            OutlinedTextField(
                                value = cashPayerAmount,
                                onValueChange = { cashPayerAmount = it },
                                label = { Text("¿Con cuánto billete pagarás?") },
                                placeholder = { Text("Ej: S/ 50.00 ó S/ 100.00") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("checkout_cash_input"),
                                shape = RoundedCornerShape(10.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = FlameOrange,
                                    unfocusedBorderColor = DarkBorder,
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White,
                                    focusedLabelColor = FlameOrange,
                                    unfocusedLabelColor = TextSecondary
                                )
                            )
                        }
                    }
                }
            }

            // General Order Notes
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "4. Notas Adicionales",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                        OutlinedTextField(
                            value = orderNotes,
                            onValueChange = { orderNotes = it },
                            placeholder = { Text("Ej: enviar cubiertos descartables, tocar timbre 2 veces...", color = TextMuted, fontSize = 12.sp) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("checkout_notes_input"),
                            shape = RoundedCornerShape(10.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = FlameOrange,
                                unfocusedBorderColor = DarkBorder,
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White
                            )
                        )
                    }
                }
            }
        }
    }
}
