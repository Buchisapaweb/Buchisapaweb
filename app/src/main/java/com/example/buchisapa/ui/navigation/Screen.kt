package com.example.buchisapa.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Home : Screen("home", "Carta & Menú")
    object Cart : Screen("cart", "Mi Pedido")
    object Checkout : Screen("checkout", "Finalizar Compra")
    object OrderSuccess : Screen("order_success/{orderId}", "Pedido Confirmado") {
        fun createRoute(orderId: String) = "order_success/$orderId"
    }
    object OrdersTracker : Screen("orders_tracker", "Seguimiento de Pedidos")
    object LibroReclamaciones : Screen("libro_reclamaciones", "Libro de Reclamaciones")
    object AdminPanel : Screen("admin_panel", "Panel Administrador")
    object Nosotros : Screen("nosotros", "Nosotros & Contacto")
}
