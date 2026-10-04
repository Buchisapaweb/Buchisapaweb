package com.example.buchisapa.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.buchisapa.data.model.*
import com.example.buchisapa.data.repository.BuchisapaRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.UUID

class MainViewModel(private val repository: BuchisapaRepository) : ViewModel() {

    val categories: StateFlow<List<Category>> = repository.categories
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val products: StateFlow<List<Product>> = repository.products
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val cartItems: StateFlow<List<CartItem>> = repository.cartItems
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val orders: StateFlow<List<Order>> = repository.orders
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val claims: StateFlow<List<Claim>> = repository.claims
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val businessConfig: StateFlow<BusinessConfig> = repository.businessConfig
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), BusinessConfig())

    val selectedCategorySlug = MutableStateFlow<String>("all")
    val searchQuery = MutableStateFlow<String>("")

    val selectedProductForCustomization = MutableStateFlow<Product?>(null)
    val selectedOrderForTicket = MutableStateFlow<Order?>(null)
    val lastCreatedOrder = MutableStateFlow<Order?>(null)

    // Filtered products
    val filteredProducts: StateFlow<List<Product>> = combine(
        products,
        selectedCategorySlug,
        searchQuery
    ) { allProducts, categorySlug, query ->
        allProducts.filter { product ->
            val matchesCategory = (categorySlug == "all" || product.categorySlug.equals(categorySlug, ignoreCase = true))
            val matchesQuery = query.isBlank() ||
                    product.name.contains(query, ignoreCase = true) ||
                    product.description.contains(query, ignoreCase = true)
            matchesCategory && matchesQuery
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Cart calculations
    val cartSubtotal: StateFlow<Double> = cartItems.map { items ->
        items.sumOf { it.itemTotal }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val cartCount: StateFlow<Int> = cartItems.map { items ->
        items.sumOf { it.quantity }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    fun selectCategory(slug: String) {
        selectedCategorySlug.value = slug
    }

    fun onSearchQueryChanged(query: String) {
        searchQuery.value = query
    }

    fun openProductCustomization(product: Product) {
        selectedProductForCustomization.value = product
    }

    fun closeProductCustomization() {
        selectedProductForCustomization.value = null
    }

    fun showTicket(order: Order) {
        selectedOrderForTicket.value = order
    }

    fun closeTicket() {
        selectedOrderForTicket.value = null
    }

    fun addCustomizedProductToCart(
        product: Product,
        quantity: Int,
        accompaniments: List<String>,
        cremas: List<String>,
        extras: List<ExtraOption>,
        instructions: String
    ) {
        viewModelScope.launch {
            val extrasTotal = extras.filter { it.selected }.sumOf { it.price }
            val unitPrice = product.price + extrasTotal
            val itemTotal = unitPrice * quantity

            val cartItem = CartItem(
                id = UUID.randomUUID().toString(),
                productId = product.id,
                productName = product.name,
                productPrice = product.price,
                productImage = product.image,
                quantity = quantity,
                selectedAccompaniments = accompaniments,
                selectedCremas = cremas,
                selectedExtras = extras.filter { it.selected },
                instructions = instructions,
                itemTotal = itemTotal
            )
            repository.addToCart(cartItem)
            closeProductCustomization()
        }
    }

    fun quickAddToCart(product: Product) {
        viewModelScope.launch {
            val cartItem = CartItem(
                id = UUID.randomUUID().toString(),
                productId = product.id,
                productName = product.name,
                productPrice = product.price,
                productImage = product.image,
                quantity = 1,
                selectedAccompaniments = product.accompaniments.take(2),
                selectedCremas = product.cremas.take(3),
                selectedExtras = emptyList(),
                instructions = "",
                itemTotal = product.price
            )
            repository.addToCart(cartItem)
        }
    }

    fun removeCartItem(itemId: String) {
        viewModelScope.launch {
            repository.removeCartItem(itemId)
        }
    }

    fun clearCart() {
        viewModelScope.launch {
            repository.clearCart()
        }
    }

    fun placeOrder(
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
        onSuccess: (Order) -> Unit
    ) {
        viewModelScope.launch {
            val currentItems = cartItems.value
            val subtotal = currentItems.sumOf { it.itemTotal }
            val fee = if (orderType == OrderType.DELIVERY) deliveryFee else 0.0
            val total = subtotal + fee

            val order = repository.createOrder(
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
                deliveryFee = fee,
                subtotal = subtotal,
                total = total,
                items = currentItems
            )
            lastCreatedOrder.value = order
            onSuccess(order)
        }
    }

    fun updateOrderStatus(orderId: String, status: OrderStatus) {
        viewModelScope.launch {
            repository.updateOrderStatus(orderId, status)
        }
    }

    fun toggleProductAvailability(productId: String, available: Boolean) {
        viewModelScope.launch {
            repository.updateProductAvailability(productId, available)
        }
    }

    fun updateProductStock(productId: String, stock: Int) {
        viewModelScope.launch {
            repository.updateProductStock(productId, stock)
        }
    }

    fun updateProductPrice(productId: String, price: Double) {
        viewModelScope.launch {
            repository.updateProductPrice(productId, price)
        }
    }

    fun submitClaim(
        fullName: String,
        docType: String,
        docNumber: String,
        email: String,
        phone: String,
        address: String,
        claimType: String,
        amount: Double,
        description: String,
        consumerClaim: String,
        onSuccess: (Claim) -> Unit
    ) {
        viewModelScope.launch {
            val claim = repository.submitClaim(
                fullName = fullName,
                docType = docType,
                docNumber = docNumber,
                email = email,
                phone = phone,
                address = address,
                claimType = claimType,
                amount = amount,
                description = description,
                consumerClaim = consumerClaim
            )
            onSuccess(claim)
        }
    }

    fun saveBusinessConfig(config: BusinessConfig) {
        viewModelScope.launch {
            repository.saveBusinessConfig(config)
        }
    }

    class Factory(private val repository: BuchisapaRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return MainViewModel(repository) as T
        }
    }
}
