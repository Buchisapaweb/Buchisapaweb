package com.example.buchisapa.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.buchisapa.data.model.*

@Entity(tableName = "categories")
data class CategoryEntity(
    @PrimaryKey val id: String,
    val slug: String,
    val name: String,
    val image: String
) {
    fun toModel() = Category(id = id, slug = slug, name = name, image = image)
}

@Entity(tableName = "products")
data class ProductEntity(
    @PrimaryKey val id: String,
    val name: String,
    val categoryId: String,
    val categorySlug: String,
    val price: Double,
    val description: String,
    val available: Boolean,
    val stock: Int,
    val image: String,
    val includesSauces: Boolean,
    val accompaniments: List<String>,
    val cremas: List<String>
) {
    fun toModel() = Product(
        id = id,
        name = name,
        categoryId = categoryId,
        categorySlug = categorySlug,
        price = price,
        description = description,
        available = available,
        stock = stock,
        image = image,
        includesSauces = includesSauces,
        accompaniments = accompaniments,
        cremas = cremas
    )
}

@Entity(tableName = "cart_items")
data class CartItemEntity(
    @PrimaryKey val id: String,
    val productId: String,
    val productName: String,
    val productPrice: Double,
    val productImage: String,
    val quantity: Int,
    val selectedAccompaniments: List<String>,
    val selectedCremas: List<String>,
    val selectedExtras: List<ExtraOption>,
    val instructions: String,
    val itemTotal: Double
) {
    fun toModel() = CartItem(
        id = id,
        productId = productId,
        productName = productName,
        productPrice = productPrice,
        productImage = productImage,
        quantity = quantity,
        selectedAccompaniments = selectedAccompaniments,
        selectedCremas = selectedCremas,
        selectedExtras = selectedExtras,
        instructions = instructions,
        itemTotal = itemTotal
    )
}

@Entity(tableName = "orders")
data class OrderEntity(
    @PrimaryKey val id: String,
    val orderNumber: String,
    val customerName: String,
    val customerPhone: String,
    val customerEmail: String,
    val orderType: String,
    val deliveryAddress: String,
    val deliveryReference: String,
    val tableNumber: String,
    val paymentMethod: String,
    val paymentAmountCash: Double,
    val notes: String,
    val status: String,
    val deliveryFee: Double,
    val subtotal: Double,
    val total: Double,
    val items: List<CartItem>,
    val createdAt: Long
) {
    fun toModel() = Order(
        id = id,
        orderNumber = orderNumber,
        customerName = customerName,
        customerPhone = customerPhone,
        customerEmail = customerEmail,
        orderType = orderType,
        deliveryAddress = deliveryAddress,
        deliveryReference = deliveryReference,
        tableNumber = tableNumber,
        paymentMethod = paymentMethod,
        paymentAmountCash = paymentAmountCash,
        notes = notes,
        status = status,
        deliveryFee = deliveryFee,
        subtotal = subtotal,
        total = total,
        items = items,
        createdAt = createdAt
    )
}

@Entity(tableName = "claims")
data class ClaimEntity(
    @PrimaryKey val id: String,
    val code: String,
    val fullName: String,
    val docType: String,
    val docNumber: String,
    val email: String,
    val phone: String,
    val address: String,
    val claimType: String,
    val amount: Double,
    val description: String,
    val consumerClaim: String,
    val status: String,
    val createdAt: Long
) {
    fun toModel() = Claim(
        id = id,
        code = code,
        fullName = fullName,
        docType = docType,
        docNumber = docNumber,
        email = email,
        phone = phone,
        address = address,
        claimType = claimType,
        amount = amount,
        description = description,
        consumerClaim = consumerClaim,
        status = status,
        createdAt = createdAt
    )
}

@Entity(tableName = "business_config")
data class BusinessConfigEntity(
    @PrimaryKey val id: String = "principal",
    val businessName: String,
    val ruc: String,
    val address: String,
    val phone: String,
    val email: String,
    val deliveryFee: Double,
    val printerIp: String,
    val printerPort: Int,
    val openingHours: String,
    val isOpen: Boolean
) {
    fun toModel() = BusinessConfig(
        id = id,
        businessName = businessName,
        ruc = ruc,
        address = address,
        phone = phone,
        email = email,
        deliveryFee = deliveryFee,
        printerIp = printerIp,
        printerPort = printerPort,
        openingHours = openingHours,
        isOpen = isOpen
    )
}
