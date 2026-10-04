package com.example.buchisapa.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Category(
    val id: String,
    val slug: String,
    val name: String,
    val image: String = ""
)

@Serializable
data class Product(
    val id: String,
    val name: String,
    val categoryId: String,
    val categorySlug: String,
    val price: Double,
    val description: String = "",
    val available: Boolean = true,
    val stock: Int = 50,
    val image: String = "",
    val includesSauces: Boolean = true,
    val accompaniments: List<String> = emptyList(),
    val cremas: List<String> = emptyList()
)

@Serializable
data class ExtraOption(
    val id: String,
    val name: String,
    val price: Double,
    var selected: Boolean = false
)

@Serializable
data class CartItem(
    val id: String,
    val productId: String,
    val productName: String,
    val productPrice: Double,
    val productImage: String,
    val quantity: Int = 1,
    val selectedAccompaniments: List<String> = emptyList(),
    val selectedCremas: List<String> = emptyList(),
    val selectedExtras: List<ExtraOption> = emptyList(),
    val instructions: String = "",
    val itemTotal: Double
)

enum class OrderType(val displayName: String) {
    DELIVERY("Delivery a Domicilio"),
    PICKUP("Recojo en Local"),
    DINE_IN("Consumo en Mesa")
}

enum class PaymentMethod(val displayName: String) {
    EFECTIVO("Efectivo"),
    YAPE_PLIN("Yape / Plin"),
    TARJETA("Tarjeta Débito/Crédito")
}

enum class OrderStatus(val displayName: String, val step: Int) {
    PENDIENTE("Pendiente", 1),
    PREPARANDO("En Preparación", 2),
    LISTO("Listo / En Camino", 3),
    ENTREGADO("Entregado", 4),
    CANCELADO("Cancelado", 0)
}

@Serializable
data class Order(
    val id: String,
    val orderNumber: String,
    val customerName: String,
    val customerPhone: String,
    val customerEmail: String = "",
    val orderType: String = OrderType.DELIVERY.name,
    val deliveryAddress: String = "",
    val deliveryReference: String = "",
    val tableNumber: String = "",
    val paymentMethod: String = PaymentMethod.EFECTIVO.name,
    val paymentAmountCash: Double = 0.0,
    val notes: String = "",
    val status: String = OrderStatus.PENDIENTE.name,
    val deliveryFee: Double = 0.0,
    val subtotal: Double = 0.0,
    val total: Double = 0.0,
    val items: List<CartItem> = emptyList(),
    val createdAt: Long = System.currentTimeMillis()
)

@Serializable
data class Claim(
    val id: String,
    val code: String,
    val fullName: String,
    val docType: String = "DNI",
    val docNumber: String,
    val email: String,
    val phone: String,
    val address: String = "",
    val claimType: String = "Reclamo", // "Reclamo" or "Queja"
    val amount: Double = 0.0,
    val description: String,
    val consumerClaim: String = "",
    val status: String = "Pendiente",
    val createdAt: Long = System.currentTimeMillis()
)

@Serializable
data class BusinessConfig(
    val id: String = "principal",
    val businessName: String = "BuchiSapa - Pollería & Sabor Amazónico",
    val ruc: String = "10723456781",
    val address: String = "Av. La Estrella con Calle 28 de Julio, Santa Clara, Ate - Lima",
    val phone: String = "+51 942 475 459",
    val email: String = "buchisapaweb@gmail.com",
    val deliveryFee: Double = 4.00,
    val printerIp: String = "192.168.8.100",
    val printerPort: Int = 80,
    val openingHours: String = "Lunes a Domingo: 6:00 PM - 5:00 AM",
    val isOpen: Boolean = true
)

@Serializable
data class HeroBanner(
    val id: String,
    val title: String,
    val subtitle: String,
    val tag: String,
    val imageUrl: String
)
