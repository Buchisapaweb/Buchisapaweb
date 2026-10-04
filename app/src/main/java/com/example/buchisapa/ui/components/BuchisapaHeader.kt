package com.example.buchisapa.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.buchisapa.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BuchisapaHeader(
    title: String,
    canNavigateBack: Boolean = false,
    onNavigateBack: () -> Unit = {},
    cartItemCount: Int = 0,
    onCartClick: () -> Unit = {},
    onAdminClick: () -> Unit = {},
    onTrackerClick: () -> Unit = {},
    onInfoClick: () -> Unit = {}
) {
    TopAppBar(
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(FlameOrange),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.LocalFireDepartment,
                        contentDescription = "BuchiSapa Flame",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }
                Column {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleLarge,
                        color = Color.White,
                        fontWeight = FontWeight.Black
                    )
                    Text(
                        text = "Pollería & Sabor Amazónico",
                        style = MaterialTheme.typography.labelSmall,
                        color = FlameAmber
                    )
                }
            }
        },
        navigationIcon = {
            if (canNavigateBack) {
                IconButton(
                    onClick = onNavigateBack,
                    modifier = Modifier.testTag("nav_back_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Volver",
                        tint = Color.White
                    )
                }
            }
        },
        actions = {
            IconButton(
                onClick = onTrackerClick,
                modifier = Modifier.testTag("nav_tracker_button")
            ) {
                Icon(
                    imageVector = Icons.Default.DeliveryDining,
                    contentDescription = "Mis Pedidos",
                    tint = TextSecondary
                )
            }
            IconButton(
                onClick = onInfoClick,
                modifier = Modifier.testTag("nav_info_button")
            ) {
                Icon(
                    imageVector = Icons.Default.Storefront,
                    contentDescription = "Nosotros y Local",
                    tint = TextSecondary
                )
            }
            IconButton(
                onClick = onAdminClick,
                modifier = Modifier.testTag("nav_admin_button")
            ) {
                Icon(
                    imageVector = Icons.Default.AdminPanelSettings,
                    contentDescription = "Panel Admin",
                    tint = FlameAmber
                )
            }
            IconButton(
                onClick = onCartClick,
                modifier = Modifier.testTag("nav_cart_button")
            ) {
                BadgedBox(
                    badge = {
                        if (cartItemCount > 0) {
                            Badge(
                                containerColor = FlameRed,
                                contentColor = Color.White
                            ) {
                                Text(
                                    text = "$cartItemCount",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 10.sp
                                )
                            }
                        }
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.ShoppingCart,
                        contentDescription = "Carrito",
                        tint = FlameOrange
                    )
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = DarkSurface
        )
    )
}
