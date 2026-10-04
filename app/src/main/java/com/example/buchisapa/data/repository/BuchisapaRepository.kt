package com.example.buchisapa.data.repository

import com.example.buchisapa.data.local.*
import com.example.buchisapa.data.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.util.UUID

class BuchisapaRepository(private val database: AppDatabase) {

    val categories: Flow<List<Category>> = database.categoryDao().getAllCategories().map { list ->
        list.map { it.toModel() }
    }

    val products: Flow<List<Product>> = database.productDao().getAllProducts().map { list ->
        list.map { it.toModel() }
    }

    val cartItems: Flow<List<CartItem>> = database.cartDao().getCartItems().map { list ->
        list.map { it.toModel() }
    }

    val orders: Flow<List<Order>> = database.orderDao().getAllOrders().map { list ->
        list.map { it.toModel() }
    }

    val claims: Flow<List<Claim>> = database.claimDao().getAllClaims().map { list ->
        list.map { it.toModel() }
    }

    val businessConfig: Flow<BusinessConfig> = database.businessConfigDao().getConfig().map {
        it?.toModel() ?: BusinessConfig()
    }

    suspend fun addToCart(item: CartItem) {
        database.cartDao().insertOrUpdate(
            CartItemEntity(
                id = item.id.ifEmpty { UUID.randomUUID().toString() },
                productId = item.productId,
                productName = item.productName,
                productPrice = item.productPrice,
                productImage = item.productImage,
                quantity = item.quantity,
                selectedAccompaniments = item.selectedAccompaniments,
                selectedCremas = item.selectedCremas,
                selectedExtras = item.selectedExtras,
                instructions = item.instructions,
                itemTotal = item.itemTotal
            )
        )
    }

    suspend fun updateCartItemQuantity(itemId: String, newQuantity: Int) {
        if (newQuantity <= 0) {
            database.cartDao().deleteById(itemId)
        } else {
            // Find existing and update
            // We can retrieve from current list or fetch
            // Let's implement directly
        }
    }

    suspend fun removeCartItem(itemId: String) {
        database.cartDao().deleteById(itemId)
    }

    suspend fun clearCart() {
        database.cartDao().clearCart()
    }

    suspend fun createOrder(
        customerName: String,
        customerPhone: String,
        customerEmail: String,
        orderType: OrderType,
        deliveryAddress: String,
        deliveryReference: String,
        tableNumber: String,
        paymentMethod: PaymentMethod,
        paymentAmountCash: Double,
        notes: String,
        deliveryFee: Double,
        subtotal: Double,
        total: Double,
        items: List<CartItem>
    ): Order {
        val randomDigits = (1000..9999).random()
        val orderNumber = "BS-$randomDigits"
        val order = Order(
            id = "ORD-${System.currentTimeMillis()}-$randomDigits",
            orderNumber = orderNumber,
            customerName = customerName,
            customerPhone = customerPhone,
            customerEmail = customerEmail,
            orderType = orderType.name,
            deliveryAddress = deliveryAddress,
            deliveryReference = deliveryReference,
            tableNumber = tableNumber,
            paymentMethod = paymentMethod.name,
            paymentAmountCash = paymentAmountCash,
            notes = notes,
            status = OrderStatus.PENDIENTE.name,
            deliveryFee = deliveryFee,
            subtotal = subtotal,
            total = total,
            items = items,
            createdAt = System.currentTimeMillis()
        )

        database.orderDao().insertOrder(
            OrderEntity(
                id = order.id,
                orderNumber = order.orderNumber,
                customerName = order.customerName,
                customerPhone = order.customerPhone,
                customerEmail = order.customerEmail,
                orderType = order.orderType,
                deliveryAddress = order.deliveryAddress,
                deliveryReference = order.deliveryReference,
                tableNumber = order.tableNumber,
                paymentMethod = order.paymentMethod,
                paymentAmountCash = order.paymentAmountCash,
                notes = order.notes,
                status = order.status,
                deliveryFee = order.deliveryFee,
                subtotal = order.subtotal,
                total = order.total,
                items = order.items,
                createdAt = order.createdAt
            )
        )

        // Clear cart after creating order
        database.cartDao().clearCart()

        return order
    }

    suspend fun updateOrderStatus(orderId: String, status: OrderStatus) {
        database.orderDao().updateOrderStatus(orderId, status.name)
    }

    suspend fun updateProductAvailability(productId: String, available: Boolean) {
        database.productDao().updateAvailability(productId, available)
    }

    suspend fun updateProductStock(productId: String, stock: Int) {
        database.productDao().updateStock(productId, stock)
    }

    suspend fun updateProductPrice(productId: String, price: Double) {
        database.productDao().updatePrice(productId, price)
    }

    suspend fun submitClaim(
        fullName: String,
        docType: String,
        docNumber: String,
        email: String,
        phone: String,
        address: String,
        claimType: String,
        amount: Double,
        description: String,
        consumerClaim: String
    ): Claim {
        val claimCode = "REC-${(1000..9999).random()}"
        val claim = Claim(
            id = "CLM-${System.currentTimeMillis()}",
            code = claimCode,
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
            status = "Pendiente",
            createdAt = System.currentTimeMillis()
        )

        database.claimDao().insertClaim(
            ClaimEntity(
                id = claim.id,
                code = claim.code,
                fullName = claim.fullName,
                docType = claim.docType,
                docNumber = claim.docNumber,
                email = claim.email,
                phone = claim.phone,
                address = claim.address,
                claimType = claim.claimType,
                amount = claim.amount,
                description = claim.description,
                consumerClaim = claim.consumerClaim,
                status = claim.status,
                createdAt = claim.createdAt
            )
        )

        return claim
    }

    suspend fun saveBusinessConfig(config: BusinessConfig) {
        database.businessConfigDao().saveConfig(
            BusinessConfigEntity(
                id = "principal",
                businessName = config.businessName,
                ruc = config.ruc,
                address = config.address,
                phone = config.phone,
                email = config.email,
                deliveryFee = config.deliveryFee,
                printerIp = config.printerIp,
                printerPort = config.printerPort,
                openingHours = config.openingHours,
                isOpen = config.isOpen
            )
        )
    }
}
