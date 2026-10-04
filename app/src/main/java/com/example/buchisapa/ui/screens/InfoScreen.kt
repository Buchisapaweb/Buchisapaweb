package com.example.buchisapa.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
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
import com.example.buchisapa.ui.theme.*
import com.example.buchisapa.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InfoScreen(
    viewModel: MainViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToClaims: () -> Unit
) {
    val context = LocalContext.current
    val businessConfig by viewModel.businessConfig.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Nosotros & Contacto",
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                },
                navigationIcon = {
                    IconButton(
                        onClick = onNavigateBack,
                        modifier = Modifier.testTag("info_back_button")
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
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Brand Story Card
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(FlameOrange),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.Restaurant, contentDescription = "BuchiSapa", tint = Color.White)
                            }
                            Column {
                                Text(
                                    text = "BuchiSapa",
                                    color = Color.White,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 18.sp
                                )
                                Text(
                                    text = "Pollería & Sabor Amazónico",
                                    color = FlameAmber,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }

                        Text(
                            text = "Nacimos con la pasión de llevar los mejores sabores de la selva peruana (Tarapoto) y combinarlos con las más crocantes hamburguesas y pollos broaster gigantes para el disfrute de las noches y madrugadas en Lima.",
                            color = TextSecondary,
                            fontSize = 13.sp,
                            lineHeight = 18.sp
                        )
                    }
                }
            }

            // Location & Schedule Card
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Text(
                            text = "Ubicación & Atención",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )

                        Row(
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            Icon(Icons.Default.LocationOn, contentDescription = "Dirección", tint = FlameOrange)
                            Column {
                                Text(text = "Dirección del Local", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                Text(text = businessConfig.address, color = TextSecondary, fontSize = 12.sp)
                            }
                        }

                        Row(
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            Icon(Icons.Default.AccessTime, contentDescription = "Horario", tint = AmazonGreen)
                            Column {
                                Text(text = "Horario Nocturno", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                Text(text = businessConfig.openingHours, color = TextSecondary, fontSize = 12.sp)
                            }
                        }

                        Row(
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            Icon(Icons.Default.Phone, contentDescription = "Teléfono", tint = FlameAmber)
                            Column {
                                Text(text = "Central de Pedidos", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                Text(text = businessConfig.phone, color = TextSecondary, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }

            // Contact WhatsApp Button
            item {
                Button(
                    onClick = {
                        val cleanPhone = businessConfig.phone.replace("[^0-9]".toRegex(), "")
                        val whatsappUri = Uri.parse("https://api.whatsapp.com/send?phone=$cleanPhone&text=Hola%20BuchiSapa,%20deseo%20hacer%20un%20pedido")
                        val intent = Intent(Intent.ACTION_VIEW, whatsappUri)
                        context.startActivity(intent)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp)
                        .testTag("whatsapp_contact_button"),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AmazonGreen)
                ) {
                    Icon(Icons.Default.Chat, contentDescription = "WhatsApp", tint = Color.White)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "Escribir al WhatsApp Oficial", fontWeight = FontWeight.Bold, color = Color.White)
                }
            }

            // Libro de Reclamaciones Link
            item {
                OutlinedButton(
                    onClick = onNavigateToClaims,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp)
                        .testTag("info_claims_link_button"),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = FlameAmber)
                ) {
                    Icon(Icons.Default.MenuBook, contentDescription = "Libro de Reclamaciones")
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "Libro de Reclamaciones Virtual", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
